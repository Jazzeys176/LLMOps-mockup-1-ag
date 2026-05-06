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
        e.created_at,
        ev.name as evaluator_name,
        e.trace_id,
        e.score,
        e.duration_ms,
        e.status
    FROM evaluations e
    LEFT JOIN evaluators ev ON e.evaluator_id = ev.id
    ORDER BY e.created_at DESC
    LIMIT ?
    """
    
    logs = query_db_dict(query, (limit,))
    
    results = []
    for log in logs:
        ts = log["created_at"]
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()
        else:
            ts = str(ts)
            
        results.append({
            "timestamp": ts,
            "evaluator_name": log.get("evaluator_name") or "Unknown",
            "trace_id": log.get("trace_id") or "",
            "score_value": log.get("score") or 0.0,
            "duration_ms": log.get("duration_ms") or 0.0,
            "status": log.get("status") or "Unknown"
        })
        
    return results
