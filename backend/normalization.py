"""
Trace Log Normalizer

Converts raw trace logs from Gemini and Groq chatbots to a standardized schema.
See trace_normalization.md for detailed specification.

Usage:
    python normalization.py

Input:  raw_trace_logs.jsonl
Output: standard_trace_logs.jsonl (appends new traces)
"""

import json
from pathlib import Path
from typing import Any


# =============================================================================
# Constants
# =============================================================================

KEEP_SPAN_TYPES = {"retrieval", "rerank", "llm"}

INPUT_FILE = "raw_trace_logs.jsonl"
OUTPUT_FILE = "standard_trace_logs.jsonl"

REQUIRED_FIELDS = [
    "trace_id", "trace_name", "session_id", "user_id", "timestamp",
    "environment", "provider", "model", "input", "output",
    "latency_ms", "status", "spans"
]


# =============================================================================
# Helper Functions
# =============================================================================

def derive_routing_decision(trace: dict) -> str | None:
    """
    Derives routing_decision for Gemini traces.

    Returns:
        - None: RAG was off (simple-qa)
        - "rag": RAG ran and found relevant docs
        - "out_of_scope": RAG ran but no relevant docs survived
    """
    if not trace.get("retrieval_executed", False):
        return None
    if trace.get("documents_found", 0) > 0:
        return "rag"
    return "out_of_scope"


def extract_usage(provider_raw: dict) -> dict:
    """
    Extracts normalized usage block from provider_raw.

    Returns:
        Dict with prompt_tokens, completion_tokens, total_tokens
    """
    raw_usage = provider_raw.get("usage", {})
    prompt_tokens = raw_usage.get("prompt_tokens")
    completion_tokens = raw_usage.get("completion_tokens")
    total_tokens = raw_usage.get("total_tokens")

    # Compute total_tokens if missing but components are available
    if total_tokens is None and prompt_tokens is not None and completion_tokens is not None:
        total_tokens = prompt_tokens + completion_tokens

    return {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
    }


def extract_retrieval_confidence(retrieval_confidence: dict | float | None) -> float | None:
    """
    Extracts the avg_score from retrieval_confidence.

    Args:
        retrieval_confidence: Can be:
            - dict with avg_score, min_score, max_score keys
            - float (already flattened)
            - None

    Returns:
        The avg_score as a float, or None
    """
    if retrieval_confidence is None:
        return None

    # If already a float/int, return as-is
    if isinstance(retrieval_confidence, (int, float)):
        return float(retrieval_confidence)

    # If dict, extract avg_score
    if isinstance(retrieval_confidence, dict):
        return retrieval_confidence.get("avg_score")

    return None


def detect_source(raw: dict) -> str:
    """
    Auto-detects trace source type based on trace fields.

    Returns:
        "gemini" or "groq"
    """
    # Gemini traces have "id" and "partitionKey" fields
    if "id" in raw or "partitionKey" in raw:
        return "gemini"

    # Groq traces have "routing_decision" at top level
    if "routing_decision" in raw:
        return "groq"

    # Fallback: check provider field
    provider = raw.get("provider", "").lower()
    if provider == "google":
        return "gemini"

    return "groq"


def validate_trace(trace: dict) -> tuple[bool, list[str]]:
    """
    Basic validation of required fields.

    Returns:
        Tuple of (is_valid, list_of_missing_fields)
    """
    missing = [f for f in REQUIRED_FIELDS if f not in trace or trace[f] is None]
    return len(missing) == 0, missing


def get_existing_trace_ids(filepath: Path) -> set[str]:
    """
    Reads all trace_ids from existing standard_trace_logs.jsonl.

    Returns:
        Set of trace_ids already processed
    """
    if not filepath.exists():
        return set()

    trace_ids = set()
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    trace = json.loads(line)
                    trace_id = trace.get("trace_id")
                    if trace_id:
                        trace_ids.add(trace_id)
                except json.JSONDecodeError:
                    continue
    return trace_ids


# =============================================================================
# Span Normalization
# =============================================================================

def _normalize_llm_usage(usage: dict | None) -> dict:
    """
    Ensures total_tokens is present in LLM span usage.
    Computes prompt + completion if needed.
    """
    if usage is None:
        return {
            "prompt_tokens": None,
            "completion_tokens": None,
            "total_tokens": None,
        }

    prompt_tokens = usage.get("prompt_tokens", 0) or 0
    completion_tokens = usage.get("completion_tokens", 0) or 0
    total_tokens = usage.get("total_tokens")

    if total_tokens is None:
        total_tokens = prompt_tokens + completion_tokens if (prompt_tokens or completion_tokens) else None

    return {
        "prompt_tokens": usage.get("prompt_tokens"),
        "completion_tokens": usage.get("completion_tokens"),
        "total_tokens": total_tokens,
    }


def _normalize_retrieval_span(span: dict) -> dict:
    """
    Normalizes retrieval span:
    - Adds documents_found to metadata if absent
    - Ensures parent_span_id exists
    """
    normalized = dict(span)

    # Ensure parent_span_id exists
    if "parent_span_id" not in normalized:
        normalized["parent_span_id"] = None

    # Add documents_found to metadata if not present
    metadata = dict(normalized.get("metadata", {}))
    if "documents_found" not in metadata:
        docs = normalized.get("output", {}).get("documents", [])
        metadata["documents_found"] = len(docs)
    normalized["metadata"] = metadata

    return normalized


def _normalize_llm_span(span: dict) -> dict:
    """
    Normalizes LLM span:
    - Ensures parent_span_id is null
    - Normalizes usage block
    """
    normalized = dict(span)

    # Set parent_span_id to null (may have been pointing to chain parent in Gemini)
    normalized["parent_span_id"] = None

    # Normalize usage
    if "usage" in normalized:
        normalized["usage"] = _normalize_llm_usage(normalized["usage"])

    return normalized


def _normalize_rerank_span(span: dict) -> dict:
    """
    Normalizes rerank span:
    - Ensures parent_span_id exists
    """
    normalized = dict(span)

    if "parent_span_id" not in normalized:
        normalized["parent_span_id"] = None

    return normalized


def _normalize_spans(spans: list, source: str) -> list:
    """
    Applies span-level normalization rules.

    For Gemini: filters out PromptTemplate / chain / chain-output / intent-classification spans.
    For both: ensures parent_span_id exists, normalizes LLM usage.
    """
    normalized_spans = []

    for span in spans:
        span_type = span.get("type")

        # Filter: keep only retrieval, rerank, llm spans
        if span_type not in KEEP_SPAN_TYPES:
            continue

        # Normalize based on span type
        if span_type == "retrieval":
            normalized_span = _normalize_retrieval_span(span)
        elif span_type == "llm":
            normalized_span = _normalize_llm_span(span)
        elif span_type == "rerank":
            normalized_span = _normalize_rerank_span(span)
        else:
            normalized_span = dict(span)
            if "parent_span_id" not in normalized_span:
                normalized_span["parent_span_id"] = None

        normalized_spans.append(normalized_span)

    return normalized_spans


# =============================================================================
# Source-Specific Normalizers
# =============================================================================

def _normalize_gemini(raw: dict) -> dict:
    """
    Normalizes Gemini HR bot raw traces.

    Transformations:
    - Drops id, partitionKey
    - Derives routing_decision
    - Extracts avg_score from retrieval_confidence dict
    - Extracts usage from provider_raw.usage
    - Filters and normalizes spans
    """
    # Start with base fields (excluding id and partitionKey)
    normalized = {
        "trace_id": raw.get("trace_id"),
        "trace_name": raw.get("trace_name"),
        "session_id": raw.get("session_id"),
        "user_id": raw.get("user_id"),
        "timestamp": raw.get("timestamp"),
        "environment": raw.get("environment"),
        "intent": raw.get("intent"),
        "routing_decision": derive_routing_decision(raw),
        "provider": raw.get("provider"),
        "model": raw.get("model"),
        "input": raw.get("input"),
        "output": raw.get("output"),
        "latency_ms": raw.get("latency_ms"),
        "status": raw.get("status"),
        "retrieval_executed": raw.get("retrieval_executed"),
        "retrieval_confidence": extract_retrieval_confidence(raw.get("retrieval_confidence")),
        "documents_found": raw.get("documents_found"),
    }

    # Normalize rag_data - extract avg_retrieval_score as retrieval_confidence
    rag_data = raw.get("rag_data")
    if rag_data:
        normalized["rag_data"] = {
            "retrieved_documents": rag_data.get("retrieved_documents", []),
            "documents_found": rag_data.get("documents_found", 0),
            "retrieval_confidence": rag_data.get("avg_retrieval_score"),
        }
    else:
        normalized["rag_data"] = None

    # Extract usage from provider_raw
    provider_raw = raw.get("provider_raw", {})
    normalized["usage"] = extract_usage(provider_raw)

    # Keep provider_raw as-is
    normalized["provider_raw"] = provider_raw

    # Normalize spans
    raw_spans = raw.get("spans", [])
    normalized["spans"] = _normalize_spans(raw_spans, "gemini")

    return normalized


def _normalize_groq(raw: dict) -> dict:
    """
    Normalizes Groq LangGraph raw traces.

    Transformations:
    - Extracts usage from provider_raw.usage
    - Adds parent_span_id: null to all spans
    - Normalizes span metadata
    """
    normalized = {
        "trace_id": raw.get("trace_id"),
        "trace_name": raw.get("trace_name"),
        "session_id": raw.get("session_id"),
        "user_id": raw.get("user_id"),
        "timestamp": raw.get("timestamp"),
        "environment": raw.get("environment"),
        "intent": raw.get("intent"),
        "routing_decision": raw.get("routing_decision"),
        "provider": raw.get("provider"),
        "model": raw.get("model"),
        "input": raw.get("input"),
        "output": raw.get("output"),
        "latency_ms": raw.get("latency_ms"),
        "status": raw.get("status"),
        "retrieval_executed": raw.get("retrieval_executed"),
        "retrieval_confidence": raw.get("retrieval_confidence"),
        "documents_found": raw.get("documents_found"),
    }

    # Pass through rag_data
    normalized["rag_data"] = raw.get("rag_data")

    # Extract usage from provider_raw
    provider_raw = raw.get("provider_raw", {})
    normalized["usage"] = extract_usage(provider_raw)

    # Keep provider_raw as-is
    normalized["provider_raw"] = provider_raw

    # Normalize spans
    raw_spans = raw.get("spans", [])
    normalized["spans"] = _normalize_spans(raw_spans, "groq")

    return normalized


# =============================================================================
# Main Entry Point
# =============================================================================

def normalize_trace(raw: dict, source: str | None = None) -> dict:
    """
    Entry point for trace normalization.
    Dispatches to the correct normalizer based on source.

    Args:
        raw: Raw trace dictionary
        source: "gemini" | "groq" | None (auto-detect)

    Returns:
        Normalized trace dictionary conforming to Standard Trace Schema
    """
    if source is None:
        source = detect_source(raw)

    if source == "gemini":
        return _normalize_gemini(raw)
    else:
        return _normalize_groq(raw)


def main() -> None:
    """
    CLI entry point.
    Reads raw traces, normalizes them, and appends to output file.
    """
    # Resolve file paths
    script_dir = Path(__file__).parent
    input_path = script_dir / INPUT_FILE
    output_path = script_dir / OUTPUT_FILE

    # Check input file exists
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return

    # Get existing trace IDs to avoid duplicates
    print(f"\nReading existing traces from {OUTPUT_FILE}...")
    existing_ids = get_existing_trace_ids(output_path)
    print(f"Found {len(existing_ids)} existing traces.")

    # Read raw traces
    print(f"\nProcessing {INPUT_FILE}...")
    raw_traces = []
    with open(input_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if line:
                try:
                    raw_traces.append(json.loads(line))
                except json.JSONDecodeError as e:
                    print(f"  Warning: Skipping malformed JSON on line {line_num}: {e}")

    if not raw_traces:
        print("No traces found in input file.")
        return

    # Process traces
    normalized_count = 0
    skipped_count = 0
    error_count = 0

    with open(output_path, 'a', encoding='utf-8') as out_file:
        for i, raw in enumerate(raw_traces, 1):
            trace_id = raw.get("trace_id", f"unknown-{i}")

            # Skip if already processed
            if trace_id in existing_ids:
                print(f"  [{i}/{len(raw_traces)}] {trace_id} - skipped (already processed)")
                skipped_count += 1
                continue

            # Detect source and normalize
            try:
                source = detect_source(raw)
                normalized = normalize_trace(raw, source)

                # Validate
                is_valid, missing = validate_trace(normalized)
                if not is_valid:
                    print(f"  [{i}/{len(raw_traces)}] {trace_id} ({source}) - validation failed: missing {missing}")
                    error_count += 1
                    continue

                # Write to output
                out_file.write(json.dumps(normalized) + '\n')
                existing_ids.add(trace_id)  # Track to avoid duplicates within same run

                print(f"  [{i}/{len(raw_traces)}] {trace_id} ({source}) - normalized")
                normalized_count += 1

            except Exception as e:
                print(f"  [{i}/{len(raw_traces)}] {trace_id} - error: {e}")
                error_count += 1

    # Summary
    print(f"\nDone!")
    print(f"  Normalized: {normalized_count}")
    print(f"  Skipped:    {skipped_count}")
    print(f"  Errors:     {error_count}")
    print(f"  Output:     {output_path}")


if __name__ == "__main__":
    main()
