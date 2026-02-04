from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.db.client import query_db_dict
from backend.api.models.analytics import (
    DashboardStats, TraceSchema, SessionSchema, TraceBubble, TraceScores
)
import json
import math

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
    params = []
    where_clause = ""
    
    if search:
        where_clause = "WHERE trace_name ILIKE ? OR input ILIKE ?"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query = f"""
    SELECT * 
    FROM traces 
    {where_clause}
    ORDER BY timestamp DESC 
    LIMIT {limit} OFFSET {offset}
    """
    
    # Need to fetch evaluations for scores
    raw_traces = query_db_dict(query, tuple(params))
    
    results = []
    for t in raw_traces:
        # Mock scores extraction or join query
        # For efficiency, we really should join, but for now individual query is safer for complex json handling
        # Or just random/mock scores if not in DB
        
        # Simple mapper
        results.append({
            "id": t["trace_id"],
            "timestamp": t["timestamp"].strftime("%m/%d/%Y, %H:%M:%S") if hasattr(t["timestamp"], 'strftime') else str(t["timestamp"]),
            "name": t["trace_name"],
            "input": t["input"],
            "output": t["output"],
            "latency": f"{int(t['latency_ms'])}ms",
            "tokens": f"{t['tokens_total']:,}",
            "cost": f"${t['cost']:.6f}",
            "scores": {
                "hallucination": 0.05,
                "context_relevance": 0.95,
                "conciseness": 0.90
            }, # In a real implementation, we'd query the evaluations table
            "status": t["status"],
            "user_id": t["user_id"],
            "session_id": t["session_id"]
        })
        
    return results

@router.get("/traces/{trace_id}", response_model=TraceSchema)
async def get_trace_detail(trace_id: str):
    query = "SELECT * FROM traces WHERE trace_id = ?"
    traces = query_db_dict(query, (trace_id,))
    
    if not traces:
        raise HTTPException(status_code=404, detail="Trace not found")
        
    t = traces[0]
    return {
        "id": t["trace_id"],
        "timestamp": t["timestamp"].strftime("%m/%d/%Y, %H:%M:%S") if hasattr(t["timestamp"], 'strftime') else str(t["timestamp"]),
        "name": t["trace_name"],
        "input": t["input"],
        "output": t["output"],
        "latency": f"{int(t['latency_ms'])}ms",
        "tokens": f"{t['tokens_total']:,}",
        "cost": f"${t['cost']:.6f}",
        "scores": {
            "hallucination": 0.05,
            "context_relevance": 0.95,
            "conciseness": 0.90
        },
        "status": t["status"],
        "user_id": t["user_id"],
        "session_id": t["session_id"]
    }

@router.get("/sessions", response_model=List[SessionSchema])
async def get_sessions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    offset = (page - 1) * limit
    params = []
    where_clause = ""
    
    if search:
        # Searching by user or session_id
        where_clause = "WHERE user_id ILIKE ? OR session_id ILIKE ?"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query = f"""
    SELECT * 
    FROM sessions 
    {where_clause}
    ORDER BY created_at DESC 
    LIMIT {limit} OFFSET {offset}
    """
    
    raw_sessions = query_db_dict(query, tuple(params))
    
    results = []
    for s in raw_sessions:
        results.append({
            "id": s["session_id"],
            "user": s["user_id"],
            "traces": s["trace_count"],
            "totalTokens": f"{s['total_tokens']:,}",
            "totalCost": f"${s['total_cost']:.6f}",
            "created": s["created_at"].strftime("%m/%d/%Y, %H:%M:%S") if hasattr(s["created_at"], 'strftime') else str(s["created_at"])
        })
        
    return results

@router.get("/sessions/{session_id}/traces", response_model=List[TraceBubble])
async def get_session_traces(session_id: str):
    """
    Get interactions for a session to render chat bubbles.
    """
    query = """
    SELECT trace_id, input, output, timestamp 
    FROM traces 
    WHERE session_id = ? 
    ORDER BY timestamp ASC
    """
    traces = query_db_dict(query, (session_id,))
    
    bubbles = []
    for t in traces:
        ts = t["timestamp"].strftime("%H:%M:%S") if hasattr(t["timestamp"], 'strftime') else str(t["timestamp"])
        
        # User Bubble
        bubbles.append({
            "role": "user",
            "content": t["input"],
            "timestamp": ts,
            "trace_id": t["trace_id"]
        })
        
        # AI Bubble (if output exists)
        if t["output"]:
            bubbles.append({
                "role": "ai",
                "content": t["output"],
                "timestamp": ts,
                "trace_id": t["trace_id"]
            })
            
    return bubbles
