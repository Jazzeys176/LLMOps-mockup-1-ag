"""
Metrics Aggregator Service

Reads standard_trace_logs.jsonl and computes dashboard metrics.
Writes pre-aggregated metrics to metrics.json for fast API responses.
"""

import json
import os
import tempfile
from datetime import datetime
from collections import defaultdict
from pathlib import Path

# Pricing per token (per 1M tokens converted to per token)
MODEL_PRICING = {
    "models/gemini-2.5-flash-lite": {
        "input": 0.10 / 1_000_000,   # $0.0000001 per token
        "output": 0.40 / 1_000_000   # $0.0000004 per token
    },
    "llama-3.1-8b-instant": {
        "input": 0.05 / 1_000_000,   # $0.00000005 per token
        "output": 0.08 / 1_000_000   # $0.00000008 per token
    },
    "llama-3.3-70b-versatile": {
        "input": 0.59 / 1_000_000,   # $0.00000059 per token
        "output": 0.79 / 1_000_000   # $0.00000079 per token
    },
}

BASE_DIR = Path(__file__).resolve().parent.parent
JSONL_PATH = BASE_DIR / "standard_trace_logs.jsonl"
METRICS_PATH = BASE_DIR / "metrics.json"


def load_traces() -> list[dict]:
    """Load all traces from JSONL file."""
    traces = []
    if not JSONL_PATH.exists():
        return traces
    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    traces.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return traces


def calculate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Calculate cost for a single trace based on model pricing."""
    pricing = MODEL_PRICING.get(model, {"input": 0, "output": 0})
    return (prompt_tokens * pricing["input"]) + (completion_tokens * pricing["output"])


def aggregate_metrics() -> dict:
    """Compute all dashboard metrics from traces."""
    traces = load_traces()

    if not traces:
        return {
            "computed_at": datetime.utcnow().isoformat() + "Z",
            "total_traces": 0,
            "avg_latency": 0,
            "total_tokens": 0,
            "total_cost": 0,
            "daily_active_users": [],
            "model_usage": [],
            "traces_by_name": [],
            "cost_by_model": []
        }

    # Basic metrics
    total_traces = len(traces)
    total_latency = sum(t.get("latency_ms", 0) or 0 for t in traces)
    avg_latency = total_latency / total_traces if total_traces > 0 else 0

    total_tokens = 0
    total_cost = 0

    # Daily active users: {date_str: set(user_ids)}
    daily_users = defaultdict(set)

    # Model usage: {model: {tokens, cost, count, latency_sum}}
    model_stats = defaultdict(lambda: {
        "tokens": 0,
        "cost": 0,
        "count": 0,
        "latency_sum": 0,
        "prompt_tokens": 0,
        "completion_tokens": 0
    })

    # Traces by name: {trace_name: count}
    traces_by_name_counts = defaultdict(int)

    for trace in traces:
        usage = trace.get("usage", {}) or {}
        prompt_tokens = usage.get("prompt_tokens", 0) or 0
        completion_tokens = usage.get("completion_tokens", 0) or 0
        trace_tokens = usage.get("total_tokens", 0) or 0

        model = trace.get("model", "unknown")
        latency = trace.get("latency_ms", 0) or 0

        # Calculate cost
        cost = calculate_cost(model, prompt_tokens, completion_tokens)

        total_tokens += trace_tokens
        total_cost += cost

        # Daily active users
        timestamp_ms = trace.get("timestamp", 0)
        if timestamp_ms:
            try:
                date_str = datetime.utcfromtimestamp(timestamp_ms / 1000).strftime("%Y-%m-%d")
                user_id = trace.get("user_id", "unknown")
                daily_users[date_str].add(user_id)
            except (ValueError, OSError):
                pass

        # Model usage
        model_stats[model]["tokens"] += trace_tokens
        model_stats[model]["cost"] += cost
        model_stats[model]["count"] += 1
        model_stats[model]["latency_sum"] += latency
        model_stats[model]["prompt_tokens"] += prompt_tokens
        model_stats[model]["completion_tokens"] += completion_tokens

        # Traces by name
        trace_name = trace.get("trace_name", "unknown") or "unknown"
        traces_by_name_counts[trace_name] += 1

    # Format daily active users (sorted by date, last 30 days max)
    daily_active_users = [
        {"date": date, "users": len(users)}
        for date, users in sorted(daily_users.items())
    ][-30:]  # Keep last 30 days

    # Format model usage (sorted by count descending)
    model_usage = [
        {
            "model": model,
            "tokens": stats["tokens"],
            "cost": round(stats["cost"], 6),
            "count": stats["count"],
            "avg_latency": round(stats["latency_sum"] / stats["count"], 2) if stats["count"] > 0 else 0
        }
        for model, stats in sorted(model_stats.items(), key=lambda x: x[1]["count"], reverse=True)
    ]

    # Format traces by name (sorted by count descending, top 10)
    traces_by_name = [
        {"name": name, "count": count}
        for name, count in sorted(traces_by_name_counts.items(), key=lambda x: x[1], reverse=True)
    ][:10]

    # Format cost by model (sorted by cost descending)
    cost_by_model = [
        {"name": model, "cost": round(stats["cost"], 6)}
        for model, stats in sorted(model_stats.items(), key=lambda x: x[1]["cost"], reverse=True)
    ]

    return {
        "computed_at": datetime.utcnow().isoformat() + "Z",
        "total_traces": total_traces,
        "avg_latency": round(avg_latency, 2),
        "total_tokens": total_tokens,
        "total_cost": round(total_cost, 6),
        "daily_active_users": daily_active_users,
        "model_usage": model_usage,
        "traces_by_name": traces_by_name,
        "cost_by_model": cost_by_model
    }


def write_metrics_atomic() -> dict:
    """Compute metrics and write to file atomically."""
    metrics = aggregate_metrics()

    # Ensure parent directory exists
    METRICS_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Atomic write: write to temp file, then rename
    temp_fd, temp_path = tempfile.mkstemp(dir=str(METRICS_PATH.parent), suffix=".json")
    try:
        with os.fdopen(temp_fd, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        os.replace(temp_path, str(METRICS_PATH))
    except Exception:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise

    return metrics


def get_metrics() -> dict:
    """Read metrics from file, or compute if file doesn't exist."""
    if METRICS_PATH.exists():
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass

    # Fallback: compute and return (but don't write)
    return aggregate_metrics()


if __name__ == "__main__":
    # For testing
    metrics = write_metrics_atomic()
    print(json.dumps(metrics, indent=2))
