from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class Trace(BaseModel):
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None
    trace_name: str
    user_id: str
    input: str
    output: str
    latency_ms: float
    tokens_total: int
    tokens_input: int
    tokens_output: int
    cost: Optional[float] = 0.0
    model: str
    status: str = "success"
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
