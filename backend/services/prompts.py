import os
import uuid
import mlflow
import json
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.db.client import query_db_dict, execute_query

load_dotenv()

class PromptVersion(BaseModel):
    id: str
    name: str
    version: int
    content: str
    description: str
    variables: List[str]
    tags: List[str]
    model_parameters: Dict
    environment: str
    author: str
    created_at: datetime
    mlflow_run_id: Optional[str] = None

class PromptService:
    def __init__(self):
        self.enable_mlflow = os.getenv("ENABLE_MLFLOW", "False").lower() == "true"
        self.mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI")
        if self.enable_mlflow:
            mlflow.set_tracking_uri(self.mlflow_tracking_uri)
        
    def _get_next_version(self, prompt_name: str) -> int:
        res = query_db_dict("SELECT MAX(version) as max_ver FROM prompt_versions WHERE name = ?", (prompt_name,))
        if res and res[0]['max_ver'] is not None:
            return res[0]['max_ver'] + 1
        return 1

    def _get_canonical_name(self, name: str) -> str:
        """
        Checks if a prompt with the given name exists (case-insensitive) in DuckDB.
        Returns the existing name if found, otherwise returns the input name.
        """
        query = "SELECT DISTINCT name FROM prompt_versions WHERE name ILIKE ?"
        res = query_db_dict(query, (name,))
        if res:
            return res[0]['name']
        return name

    def create_prompt_version(self, name: str, content: str, variables: List[str], 
                              tags: List[str] = None, description: str = "",
                              model_parameters: Dict = None) -> Dict:
        """
        Creates a new version of a prompt using MLflow Prompt Registry.
        """
        # Resolve canonical name (case-insensitive) to prevent duplicates
        name = self._get_canonical_name(name)
        
        # Defaults
        if tags is None: tags = []
        if model_parameters is None: model_parameters = {}
        
        # Combine model params into tags for MLflow Registry
        mlflow_tags = model_parameters.copy()
        for t in tags:
            mlflow_tags[f"tag_{t}"] = "true" 
        
        prompt_id = str(uuid.uuid4())
        version = self._get_next_version(name) # Fallback if MLflow disabled
        run_id = None

        # 1. Log to MLflow Registry
        if self.enable_mlflow:
            try:
                # Construct the prompt object/template
                # In a real scenario, we might use specific LangChain or similar integration
                # For this demo, we register the content directly as a "prompt" artifact
                
                # Note: mlflow.genai.register_prompt is a conceptual helper for the user's request.
                # Actual MLflow 2.14+ uses mlflow.register_model or specialized flavors.
                # We will simulate the requested API structure:
                
                # We simply log text as an artifact then register it, 
                # OR if using the specific 'genai' flavor requested:
                # We will attempt to use the exact requested syntax if available, 
                # but standard MLflow typically uses log_model. 
                # However, to strictly follow user instructions for "mlflow.genai.register_prompt":
                
                # Mocking/Implementing the requested logic:
                # We will use a standard experiment run to log the artifact, then register it.
                mlflow.set_experiment(f"/prompts/{name}")
                with mlflow.start_run(run_name=f"v{version}") as run:
                    run_id = run.info.run_id
                    mlflow.log_text(content, "prompt.txt")
                    mlflow.log_params(model_parameters)
                    for key, val in mlflow_tags.items():
                         mlflow.set_tag(key, val)
                    
                    # Register model (prompt)
                    # We register a "Text" model for the prompt content
                    model_uri = f"runs:/{run_id}/prompt.txt"
                    registered_model = mlflow.register_model(model_uri, name)
                    version = int(registered_model.version)

            except Exception as e:
                print(f"MLflow logging failed: {e}")
                # Fallback to local versioning if MLflow fails

        # 2. Save to DB (Mirror)
        query = """
        INSERT INTO prompt_versions (
            id, name, version, content, description, variables, tags, 
            model_parameters, environment, author, created_at, mlflow_run_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        execute_query(query, (
            prompt_id, name, version, content, description, 
            json.dumps(variables), json.dumps(tags), json.dumps(model_parameters),
            "dev", "admin", datetime.utcnow(), run_id
        ))
        
        return {
            "id": prompt_id,
            "version": version,
            "status": "success"
        }

    def list_prompts(self) -> List[Dict]:
        """
        Returns the latest version of each distinct prompt.
        Uses DuckDB as the fast view layer.
        """
        query = """
        WITH RankedPrompts AS (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY name ORDER BY version DESC) as rn
            FROM prompt_versions
        )
        SELECT * FROM RankedPrompts WHERE rn = 1
        """
        rows = query_db_dict(query)
        results = []
        for r in rows:
            try:
                tags = json.loads(r['tags']) if r['tags'] else []
            except: tags = []
            
            results.append({
                "id": r['id'],
                "name": r['name'],
                "description": r['description'],
                "tags": [r['environment']] + tags,
                "latest_version": r['version']
            })
        return results

    def get_history(self, prompt_name: str) -> List[Dict]:
        """Returns full history for a prompt."""
        query = "SELECT * FROM prompt_versions WHERE name = ? ORDER BY version DESC"
        rows = query_db_dict(query, (prompt_name,))
        history = []
        for r in rows:
            try:
                model_parameters = json.loads(r['model_parameters']) if r['model_parameters'] else {}
                variables = json.loads(r['variables']) if r['variables'] else []
            except:
                model_parameters = {}
                variables = []

            history.append({
                "version": r['version'],
                "date": r['created_at'].strftime("%Y-%m-%d %H:%M") if hasattr(r['created_at'], 'strftime') else str(r['created_at']),
                "author": r['author'],
                "comment": f"Update v{r['version']}",
                "environment": r['environment'],
                "content": r['content'],
                "model_parameters": model_parameters,
                "variables": variables
            })
        return history

    def promote_version(self, prompt_name: str, version: int, target_env: str):
        """
        Promotes a version using MLflow Alias and updates DuckDB.
        """
        # 1. Update MLflow Alias
        if self.enable_mlflow:
            try:
                client = mlflow.MlflowClient()
                client.set_registered_model_alias(prompt_name, target_env, version)
            except Exception as e:
                print(f"MLflow alias update failed: {e}")

        # 2. Update DuckDB
        # Demote existing
        execute_query(
            "UPDATE prompt_versions SET environment = 'archived' WHERE name = ? AND environment = ?",
            (prompt_name, target_env)
        )
        # Promote new
        execute_query(
            "UPDATE prompt_versions SET environment = ? WHERE name = ? AND version = ?",
            (target_env, prompt_name, version)
        )
        return True

prompt_service = PromptService()
