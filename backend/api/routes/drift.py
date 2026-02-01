from fastapi import APIRouter, HTTPException
from backend.services.drift import DriftService
from typing import List

router = APIRouter(prefix="/api/v1/drift", tags=["drift"])
drift_service = DriftService()

@router.post("/check")
async def check_drift(metric: str, current: List[float], baseline: List[float]):
    """
    Manually trigger drift check and RCA.
    """
    result = await drift_service.check_drift_and_analyze(metric, current, baseline)
    return result
