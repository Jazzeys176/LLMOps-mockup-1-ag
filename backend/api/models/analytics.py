from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

class TraceMetric(BaseModel):
    label: str
    value: float
    unit: Optional[str] = None
    change: Optional[float] = None

class DashboardStats(BaseModel):
    total_traces: int
    total_cost: float
    total_tokens: int
    avg_latency: float
    first_response_accuracy: float
    escalation_rate: float
    daily_stats: List[Dict[str, Any]] = []
    traces_by_name: List[Dict[str, Any]] = []
    cost_by_model: List[Dict[str, Any]] = []
    evaluation_summary: List[Dict[str, Any]] = []
    model_usage_details: List[Dict[str, Any]] = []

class TraceScores(BaseModel):
    hallucination: float
    context_relevance: float
    conciseness: float

class TraceSchema(BaseModel):
    id: str
    timestamp: str
    name: str
    input: str
    output: Optional[str] = None
    latency: str
    tokens: str
    cost: str
    scores: Optional[TraceScores] = None
    status: str
    user_id: str
    session_id: str

class SessionSchema(BaseModel):
    id: str
    user: str
    traces: int
    totalTokens: str
    totalCost: str
    created: str

class TraceBubble(BaseModel):
    role: str # 'user' or 'ai'
    content: str
    timestamp: str
    trace_id: str


# Live Dashboard Models (from JSONL metrics)
class DailyActiveUsers(BaseModel):
    date: str
    users: int


class ModelUsage(BaseModel):
    model: str
    tokens: int
    cost: float
    count: int
    avg_latency: float


class TraceByName(BaseModel):
    name: str
    count: int


class CostByModel(BaseModel):
    name: str
    cost: float


class LiveDashboardStats(BaseModel):
    """Dashboard stats computed from standard_trace_logs.jsonl"""
    computed_at: Optional[str] = None
    total_traces: int
    avg_latency: float
    total_tokens: int
    total_cost: float
    daily_active_users: List[DailyActiveUsers] = []
    model_usage: List[ModelUsage] = []
    traces_by_name: List[TraceByName] = []
    cost_by_model: List[CostByModel] = []
