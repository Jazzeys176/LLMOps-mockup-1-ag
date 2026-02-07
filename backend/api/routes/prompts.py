from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.services.prompts import prompt_service

router = APIRouter(prefix="/api/v1", tags=["prompts"])

class PromptCreateRequest(BaseModel):
    name: str
    content: str
    variables: List[str]
    tags: Optional[List[str]] = []
    description: Optional[str] = ""
    model_parameters: Optional[Dict[str, Any]] = {}

class PromoteRequest(BaseModel):
    version: int
    environment: str

@router.get("/prompts")
def get_prompts():
    return prompt_service.list_prompts()

@router.post("/prompts")
def create_prompt(request: PromptCreateRequest):
    return prompt_service.create_prompt_version(
        request.name, 
        request.content, 
        request.variables, 
        request.tags,
        request.description,
        request.model_parameters
    )

@router.get("/prompts/{name}/history")
def get_history(name: str):
    return prompt_service.get_history(name)

@router.post("/prompts/{name}/promote")
def promote_prompt(name: str, request: PromoteRequest):
    success = prompt_service.promote_version(name, request.version, request.environment)
    return {"status": "success", "environment": request.environment}
