from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.services.evaluator import EvaluatorService
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/evaluations", tags=["evaluations"])
evaluator_service = EvaluatorService()

@router.post("/run")
async def run_evaluation(trace_data: Dict[str, Any]):
    """
    Trigger an evaluation run for a specific trace.
    Returns results immediately (demo mode) or task ID.
    """
    results = await evaluator_service.run_evaluation(trace_data)
    return {"status": "success", "results": results}
