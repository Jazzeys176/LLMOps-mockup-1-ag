from fastapi import APIRouter
from backend.db.client import query_db_dict, execute_query
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
import re

router = APIRouter(prefix="/api/v1/templates", tags=["templates"])

class TemplateCreate(BaseModel):
    name: str
    description: str
    model: str
    template: str

@router.get("/")
async def list_templates():
    query = "SELECT id, name, version, description, model, inputs, template FROM templates"
    rows = query_db_dict(query)
    # DuckDB JSON columns are returned as strings in fetchall if using execute, 
    # but we should safely parse them.
    for row in rows:
        if isinstance(row["inputs"], str):
            try:
                row["inputs"] = json.loads(row["inputs"])
            except:
                row["inputs"] = []
    return rows

@router.post("/")
async def create_template(tmpl: TemplateCreate):
    template_id = f"tmpl_{uuid.uuid4().hex[:8]}"
    
    # regex auto-extraction for variables {{var}}
    inputs = list(set(re.findall(r"\{\{\s*(\w+)\s*\}\}", tmpl.template)))
    
    query = """
    INSERT INTO templates (id, name, version, description, model, inputs, template)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    execute_query(query, (
        template_id, 
        tmpl.name, 
        "v1", 
        tmpl.description, 
        tmpl.model, 
        json.dumps(inputs), 
        tmpl.template
    ))
    return {"id": template_id, "status": "success"}
