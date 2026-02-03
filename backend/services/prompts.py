import os
import uuid
import mlflow
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()

# Mocking a Delta Table writer for this demo since we don't have a live Spark cluster.
# In production, this would use `delta-spark` or `pandas` to write to ADLS/S3.

class PromptVersion(BaseModel):
    prompt_id: str
    prompt_name: str
    prompt_text: str
    variables: List[str]
    version: int
    environment: str  # 'prod', 'staging', 'dev', 'archived'
    is_active: bool
    created_at: datetime

class PromptService:
    def __init__(self):
        # In-memory storage for the demo. In prod, this is a Delta Table.
        self._prompts_db = []
        self.mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        
    def _get_next_version(self, prompt_name: str) -> int:
        versions = [p.version for p in self._prompts_db if p.prompt_name == prompt_name]
        return max(versions) + 1 if versions else 1

    def create_prompt_version(self, name: str, content: str, variables: List[str], tags: List[str] = None) -> PromptVersion:
        """
        Creates a new version of a prompt.
        1. Logs artifact to MLflow.
        2. Saves metadata row to 'Database' (Delta).
        """
        version = self._get_next_version(name)
        prompt_id = str(uuid.uuid4())
        
        new_prompt = PromptVersion(
            prompt_id=prompt_id,
            prompt_name=name,
            prompt_text=content,
            variables=variables,
            version=version,
            environment="dev", # Default new versions to dev
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # 1. Log to MLflow (Mocked for demo if no server)
        try:
            mlflow.set_tracking_uri(self.mlflow_tracking_uri)
            mlflow.set_experiment(f"/prompts/{name}")
            with mlflow.start_run(run_name=f"v{version}"):
                mlflow.log_param("version", version)
                mlflow.log_text(content, "prompt.txt")
                if tags:
                    for tag in tags:
                        mlflow.set_tag("custom_tag", tag)
        except Exception as e:
            print(f"MLflow logging failed (optional): {e}")

        # 2. Save to DB
        self._prompts_db.append(new_prompt)
        return new_prompt

    def list_prompts(self) -> List[Dict]:
        """Returns the latest version of each distinct prompt."""
        # Group by name, find max version
        latest = {}
        for p in self._prompts_db:
            if p.prompt_name not in latest or p.version > latest[p.prompt_name].version:
                latest[p.prompt_name] = p
        
        return [
            {
                "id": p.prompt_id,
                "name": p.prompt_name,
                "description": f"Latest: v{p.version} ({p.environment})", 
                "tags": [p.environment] 
            }
            for p in latest.values()
        ]

    def get_history(self, prompt_name: str) -> List[Dict]:
        """Returns full history for a prompt."""
        history = [p for p in self._prompts_db if p.prompt_name == prompt_name]
        return sorted([
            {
                "version": f"v{p.version}",
                "date": p.created_at.strftime("%Y-%m-%d %H:%M"),
                "author": "admin", # Mock author
                "comment": f"Update to v{p.version}",
                "environment": p.environment 
            }
            for p in history
        ], key=lambda x: x['version'], reverse=True)

    def promote_version(self, prompt_name: str, version: int, target_env: str):
        """
        Promotes a specific version to an environment (e.g., 'prod').
        Demotes any existing version in that environment.
        """
        # 1. Demote existing
        for p in self._prompts_db:
            if p.prompt_name == prompt_name and p.environment == target_env:
                p.environment = "archived"
        
        # 2. Promote target
        target = next((p for p in self._prompts_db if p.prompt_name == prompt_name and p.version == version), None)
        if target:
            target.environment = target_env
            return True
        return False

# Singleton instance
prompt_service = PromptService()

# Seed some initial data
prompt_service.create_prompt_version(
    "Factory Assistant", 
    "You are a helpful factory assistant.\nContext: {context}", 
    ["context"], 
    ["safety"]
)
prompt_service.create_prompt_version(
    "Safety Classifier", 
    "Classify the following incident: {incident}", 
    ["incident"], 
    ["classification"]
)
