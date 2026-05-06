from fastapi import APIRouter
from backend.db.client import query_db_dict, execute_query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json

router = APIRouter(prefix="/api/v1/evaluators", tags=["evaluators"])

class EvaluatorCreate(BaseModel):
    name: str
    score_name: str
    template_id: str
    target: str
    status: str
    variable_mapping: Dict[str, str]
    execution: Dict[str, Any]

class StatusUpdate(BaseModel):
    status: str

class SamplingUpdate(BaseModel):
    sampling_rate: float

@router.get("/")
async def list_evaluators():
    query = "SELECT id, name, score_name, template_id, target, status, variable_mapping, execution FROM evaluators"
    rows = query_db_dict(query)
    
    # parse JSON
    for row in rows:
        if isinstance(row["variable_mapping"], str):
            try: row["variable_mapping"] = json.loads(row["variable_mapping"])
            except: row["variable_mapping"] = {}
        if isinstance(row["execution"], str):
            try: row["execution"] = json.loads(row["execution"])
            except: row["execution"] = {}
            
    return rows

@router.post("/")
async def create_evaluator(ev: EvaluatorCreate):
    eval_id = f"eval_{uuid.uuid4().hex[:8]}"
    
    query = """
    INSERT INTO evaluators (id, name, score_name, template_id, target, status, variable_mapping, execution)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    execute_query(query, (
        eval_id,
        ev.name,
        ev.score_name,
        ev.template_id,
        ev.target,
        ev.status,
        json.dumps(ev.variable_mapping),
        json.dumps(ev.execution)
    ))
    return {"id": eval_id, "status": "success"}

@router.post("/{evaluator_id}/status")
async def update_status(evaluator_id: str, payload: StatusUpdate):
    query = "UPDATE evaluators SET status = ? WHERE id = ?"
    execute_query(query, (payload.status, evaluator_id))
    return {"status": "success"}

@router.post("/{evaluator_id}/sampling")
async def update_sampling(evaluator_id: str, payload: SamplingUpdate):
    # This is slightly tricky since execution is JSON, but duckdb supports JSON updates or we can just fetch, modify, write
    # We will fetch, modify, write for simplicity across DB versions
    select_q = "SELECT execution FROM evaluators WHERE id = ?"
    rows = query_db_dict(select_q, (evaluator_id,))
    if not rows:
        return {"error": "Not found"}
        
    execution_str = rows[0]["execution"]
    execution_data = {}
    if isinstance(execution_str, str):
        try: execution_data = json.loads(execution_str)
        except: pass
    elif isinstance(execution_str, dict):
        execution_data = execution_str
        
    execution_data["sampling_rate"] = payload.sampling_rate
    
    update_q = "UPDATE evaluators SET execution = ? WHERE id = ?"
    execute_query(update_q, (json.dumps(execution_data), evaluator_id))
    return {"status": "success"}
