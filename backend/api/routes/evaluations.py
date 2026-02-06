from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from backend.services.evaluator import EvaluatorService
from backend.db.client import query_db_dict
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/v1/evaluations", tags=["evaluations"])
evaluator_service = EvaluatorService()

class EvaluationLogItem(BaseModel):
    timestamp: Optional[str]
    evaluator_name: str
    trace_id: str
    score_value: float
    duration_ms: float
    status: str

@router.post("/run")
async def run_evaluation(trace_data: Dict[str, Any]):
    """
    Trigger an evaluation run for a specific trace.
    Returns results immediately (demo mode) or task ID.
    """
    results = await evaluator_service.run_evaluation(trace_data)
    return {"status": "success", "results": results}

@router.get("/logs", response_model=List[EvaluationLogItem])
async def get_evaluation_logs(
    limit: int = Query(50, ge=1, le=200)
):
    """
    Get recent evaluation logs.
    """
    query = """
    SELECT 
        timestamp,
        evaluator_name,
        trace_id,
        score_value,
        duration_ms,
        status
    FROM evaluations
    ORDER BY timestamp DESC
    LIMIT ?
    """
    
    logs = query_db_dict(query, (limit,))
    
    # Format timestamp if needed, though Pydantic might handle datetime objects if we configured it.
    # The current client.py query_db_dict returns native python types, so timestamp is likely a datetime object.
    # We'll explicitly convert to ISO string to match the response model which expects string (or rely on pydantic automatic conversion if we used datetime type).
    # Since I defined timestamp as Optional[str], I will handle string conversion.
    
    results = []
    for log in logs:
        ts = log["timestamp"]
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()
        else:
            ts = str(ts)
            
        results.append({
            "timestamp": ts,
            "evaluator_name": log["evaluator_name"],
            "trace_id": log["trace_id"],
            "score_value": log["score_value"],
            "duration_ms": log["duration_ms"],
            "status": log["status"]
        })
        
    return results
