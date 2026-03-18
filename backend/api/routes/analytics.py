from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pathlib import Path
from backend.db.client import query_db_dict
from backend.api.models.analytics import (
    DashboardStats, TraceSchema, SessionSchema, TraceBubble, TraceScores,
    LiveDashboardStats
)
from backend.services.metrics_aggregator import get_metrics, calculate_cost
import json
import math
import datetime

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get aggregated KPIs for the dashboard.
    """
    # Summary Metrics
    summary_query = """
    SELECT 
        COUNT(*) as total_traces,
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(SUM(tokens_total), 0) as total_tokens,
        COALESCE(AVG(latency_ms), 0) as avg_latency
    FROM traces
    """
    summary = query_db_dict(summary_query)[0]
    
    # Traces by Name
    traces_query = """
    SELECT trace_name as name, COUNT(*) as count 
    FROM traces 
    GROUP BY trace_name 
    ORDER BY count DESC 
    LIMIT 10
    """
    traces_by_name = query_db_dict(traces_query)

    # Cost by Model
    cost_query = """
    SELECT model as name, SUM(cost) as cost
    FROM traces
    WHERE model IS NOT NULL
    GROUP BY model
    ORDER BY cost DESC
    """
    cost_by_model = query_db_dict(cost_query)
    
    # Calculate First Response Accuracy
    # Definition: (Sum of 'accuracy' score for first trace of sessions) / (Total number of first traces) * 100
    accuracy_query = """
    WITH FirstTraces AS (
        SELECT 
            t.trace_id,
            t.session_id,
            ROW_NUMBER() OVER(PARTITION BY t.session_id ORDER BY t.timestamp ASC) as rn
        FROM traces t
    )
    SELECT 
        AVG(e.score_value) * 100 as accuracy
    FROM FirstTraces ft
    JOIN evaluations e ON ft.trace_id = e.trace_id
    WHERE ft.rn = 1 AND (e.score_name = 'accuracy' OR e.score_name = 'Answer Accuracy')
    """
    accuracy_result = query_db_dict(accuracy_query)
    first_response_accuracy = round(accuracy_result[0]['accuracy'], 1) if accuracy_result and accuracy_result[0]['accuracy'] is not None else 0.0

    # Evaluation Summary
    eval_query = """
    SELECT evaluator_name as name, COUNT(*) as count, AVG(score_value) as average
    FROM evaluations
    GROUP BY evaluator_name
    """
    eval_summary = query_db_dict(eval_query)

    # Model Usage Details
    usage_query = """
    SELECT model as name, SUM(tokens_total) as tokens, SUM(cost) as cost
    FROM traces
    WHERE model IS NOT NULL
    GROUP BY model
    """
    model_usage = query_db_dict(usage_query)
    
    return {
        "total_traces": summary["total_traces"],
        "total_cost": round(summary["total_cost"], 4),
        "total_tokens": summary["total_tokens"],
        "avg_latency": round(summary["avg_latency"], 2),
        "first_response_accuracy": first_response_accuracy,
        "escalation_rate": 0.0,
        "daily_stats": [], # Can be populated if needed
        "traces_by_name": traces_by_name,
        "cost_by_model": [{"name": r["name"], "cost": round(r["cost"], 4)} for r in cost_by_model],
        "evaluation_summary": [{"name": r["name"], "count": r["count"], "average": round(r["average"], 3)} for r in eval_summary],
        "model_usage_details": [{"name": r["name"], "tokens": r["tokens"], "cost": round(r["cost"], 6)} for r in model_usage]
    }

@router.get("/traces", response_model=List[TraceSchema])
async def get_traces(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    offset = (page - 1) * limit
    
    # Path to the standard trace logs jsonl file
    # Ensure this path logic resolves to wherever standard_trace_logs.jsonl resides
    # based on backend structure. Given it's at backend/standard_trace_logs.jsonl
    base_dir = Path(__file__).resolve().parent.parent.parent
    jsonl_path = base_dir / "standard_trace_logs.jsonl"
    
    traces = []
    
    if jsonl_path.exists():
        with open(jsonl_path, "r") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    t = json.loads(line)
                    # Apply search filter if provided
                    if search:
                        search_lower = search.lower()
                        name_match = search_lower in t.get("trace_name", "").lower()
                        input_match = search_lower in json.dumps(t.get("input", {})).lower()
                        if not (name_match or input_match):
                            continue
                    traces.append(t)
                except json.JSONDecodeError:
                    continue

    # Sort traces descending by timestamp
    traces.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    
    # Apply pagination
    paginated_raw = traces[offset : offset + limit]
    
    # Formatting helper function for input/output objects
    def format_io(io_data):
        if not io_data:
            return ""
        if isinstance(io_data, dict):
            # Try to grab the common 'query', 'answer', or 'text' fields
            if "query" in io_data: return io_data["query"]
            if "answer" in io_data: return io_data["answer"]
            if "text" in io_data: return io_data["text"]
            return json.dumps(io_data)
        return str(io_data)
        
    def safe_format_time(ts_ms):
        if not ts_ms: return ""
        try:
            dt = datetime.datetime.utcfromtimestamp(ts_ms / 1000)
            return dt.strftime("%m/%d/%Y, %H:%M:%S")
        except:
            return str(ts_ms)
            
    results = []
    for t in paginated_raw:
        usage = t.get("usage", {})
        prompt_tokens = usage.get("prompt_tokens") or 0
        completion_tokens = usage.get("completion_tokens") or 0
        total_tokens = usage.get("total_tokens") or (prompt_tokens + completion_tokens)
        
        # Determine cost
        cost = calculate_cost(t.get("model", ""), prompt_tokens, completion_tokens)
        
        # Provide fallback/mock scores as previously done or if embedded in trace
        results.append({
            "id": t.get("trace_id", ""),
            "timestamp": safe_format_time(t.get("timestamp")),
            "name": t.get("trace_name", "Unknown"),
            "input": format_io(t.get("input", {})),
            "output": format_io(t.get("output", {})),
            "latency": f"{int(t.get('latency_ms', 0))}ms",
            "tokens": f"{total_tokens:,}",
            "cost": f"${cost:.6f}",
            "scores": {
                "hallucination": 0.05,
                "context_relevance": 0.95,
                "conciseness": 0.90
            },
            "status": t.get("status", "unknown"),
            "user_id": t.get("user_id", "unknown"),
            "session_id": t.get("session_id", "unknown")
        })
        
    return results

@router.get("/traces/{trace_id}", response_model=TraceSchema)
async def get_trace_detail(trace_id: str):
    base_dir = Path(__file__).resolve().parent.parent.parent
    jsonl_path = base_dir / "standard_trace_logs.jsonl"
    
    target_trace = None
    if jsonl_path.exists():
        with open(jsonl_path, "r") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    t = json.loads(line)
                    if t.get("trace_id") == trace_id:
                        target_trace = t
                        break
                except json.JSONDecodeError:
                    continue
                    
    if not target_trace:
        raise HTTPException(status_code=404, detail="Trace not found")
        
    # Helpers
    def format_io(io_data):
        if not io_data: return ""
        if isinstance(io_data, dict):
            if "query" in io_data: return io_data["query"]
            if "answer" in io_data: return io_data["answer"]
            if "text" in io_data: return io_data["text"]
            return json.dumps(io_data)
        return str(io_data)
        
    def safe_format_time(ts_ms):
        if not ts_ms: return ""
        try:
            dt = datetime.datetime.utcfromtimestamp(ts_ms / 1000)
            return dt.strftime("%m/%d/%Y, %H:%M:%S")
        except:
            return str(ts_ms)
            
    usage = target_trace.get("usage", {})
    prompt_tokens = usage.get("prompt_tokens") or 0
    completion_tokens = usage.get("completion_tokens") or 0
    total_tokens = usage.get("total_tokens") or (prompt_tokens + completion_tokens)
    cost = calculate_cost(target_trace.get("model", ""), prompt_tokens, completion_tokens)
    
    return {
        "id": target_trace.get("trace_id", ""),
        "timestamp": safe_format_time(target_trace.get("timestamp")),
        "name": target_trace.get("trace_name", "Unknown"),
        "input": format_io(target_trace.get("input", {})),
        "output": format_io(target_trace.get("output", {})),
        "latency": f"{int(target_trace.get('latency_ms', 0))}ms",
        "tokens": f"{total_tokens:,}",
        "cost": f"${cost:.6f}",
        "scores": {
            "hallucination": 0.05,
            "context_relevance": 0.95,
            "conciseness": 0.90
        },
        "status": target_trace.get("status", "unknown"),
        "user_id": target_trace.get("user_id", "unknown"),
        "session_id": target_trace.get("session_id", "unknown")
    }

@router.get("/sessions", response_model=List[SessionSchema])
async def get_sessions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    offset = (page - 1) * limit
    
    base_dir = Path(__file__).resolve().parent.parent.parent
    jsonl_path = base_dir / "standard_trace_logs.jsonl"
    
    # Store aggregated sessions: session_id -> {metrics}
    sessions_map = {}
    
    from backend.services.metrics_aggregator import calculate_cost

    if jsonl_path.exists():
        with open(jsonl_path, "r") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    t = json.loads(line)
                    session_id = t.get("session_id")
                    if not session_id:
                        continue
                        
                    user_id = t.get("user_id", "unknown")
                    timestamp = t.get("timestamp", 0)
                    
                    usage = t.get("usage", {})
                    prompt_tokens = usage.get("prompt_tokens") or 0
                    completion_tokens = usage.get("completion_tokens") or 0
                    total_tokens = usage.get("total_tokens") or (prompt_tokens + completion_tokens)
                    cost = calculate_cost(t.get("model", ""), prompt_tokens, completion_tokens)
                    
                    if session_id not in sessions_map:
                        sessions_map[session_id] = {
                            "session_id": session_id,
                            "user_id": user_id,
                            "trace_count": 0,
                            "total_tokens": 0,
                            "total_cost": 0.0,
                            "created_at": timestamp
                        }
                    
                    s = sessions_map[session_id]
                    s["trace_count"] += 1
                    s["total_tokens"] += total_tokens
                    s["total_cost"] += cost
                    if timestamp < s["created_at"]:
                        s["created_at"] = timestamp
                        
                except Exception:
                    continue
                    
    # Filter sessions
    filtered_sessions = []
    if search:
        search_lower = search.lower()
        for session in sessions_map.values():
            if search_lower in session["session_id"].lower() or search_lower in session["user_id"].lower():
                filtered_sessions.append(session)
    else:
        filtered_sessions = list(sessions_map.values())
        
    # Sort descending by created_at
    filtered_sessions.sort(key=lambda x: x["created_at"], reverse=True)
    
    paginated_sessions = filtered_sessions[offset : offset + limit]
    
    def safe_format_time(ts_ms):
        if not ts_ms: return ""
        try:
            dt = datetime.datetime.utcfromtimestamp(ts_ms / 1000)
            return dt.strftime("%m/%d/%Y, %H:%M:%S")
        except:
            return str(ts_ms)
            
    results = []
    for s in paginated_sessions:
        results.append({
            "id": s["session_id"],
            "user": s["user_id"],
            "traces": s["trace_count"],
            "totalTokens": f"{s['total_tokens']:,}",
            "totalCost": f"${s['total_cost']:.6f}",
            "created": safe_format_time(s["created_at"])
        })
        
    return results

@router.get("/sessions/{session_id}/traces", response_model=List[TraceBubble])
async def get_session_traces(session_id: str):
    """
    Get interactions for a session to render chat bubbles.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    jsonl_path = base_dir / "standard_trace_logs.jsonl"
    
    traces = []
    if jsonl_path.exists():
        with open(jsonl_path, "r") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    t = json.loads(line)
                    if t.get("session_id") == session_id:
                        traces.append(t)
                except json.JSONDecodeError:
                    continue
                    
    # Sort ascending by timestamp for chronological chat flow
    traces.sort(key=lambda x: x.get("timestamp", 0))
    
    # Helper for extracting text
    def extract_text(io_data):
        if not io_data: return ""
        if isinstance(io_data, dict):
            if "query" in io_data: return io_data["query"]
            if "answer" in io_data: return io_data["answer"]
            if "text" in io_data: return io_data["text"]
            return json.dumps(io_data)
        return str(io_data)
        
    def format_bubble_time(ts_ms):
        if not ts_ms: return ""
        try:
            dt = datetime.datetime.utcfromtimestamp(ts_ms / 1000)
            return dt.strftime("%H:%M:%S")
        except:
            return str(ts_ms)
            
    bubbles = []
    for t in traces:
        ts = format_bubble_time(t.get("timestamp"))
        input_text = extract_text(t.get("input", {}))
        output_text = extract_text(t.get("output", {}))
        trace_uid = t.get("trace_id", "")
        
        # User Bubble
        if input_text:
            bubbles.append({
                "role": "user",
                "content": input_text,
                "timestamp": ts,
                "trace_id": trace_uid
            })
            
        # AI Bubble
        if output_text:
            bubbles.append({
                "role": "ai",
                "content": output_text,
                "timestamp": ts,
                "trace_id": trace_uid
            })

    return bubbles


@router.get("/dashboard-live", response_model=LiveDashboardStats)
async def get_live_dashboard_stats():
    """
    Get live dashboard metrics from standard_trace_logs.jsonl.

    This endpoint reads pre-computed metrics from metrics.json which is
    updated every 10 seconds by the background metrics worker.

    Returns metrics including:
    - total_traces: Total number of traces
    - avg_latency: Average latency in milliseconds
    - total_tokens: Total tokens used
    - total_cost: Total cost in USD
    - daily_active_users: Daily active user counts
    - model_usage: Per-model usage statistics
    """
    return get_metrics()
