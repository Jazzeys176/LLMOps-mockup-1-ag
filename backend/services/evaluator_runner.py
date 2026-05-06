import os
import json
import uuid
import random
import time
import asyncio
from pathlib import Path
from openai import AzureOpenAI

import sys
# Add backend to path so imports work when called from watcher
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from backend.db.client import query_db_dict, execute_query

TRACE_FILE = BASE_DIR / "backend" / "standard_trace_logs.jsonl"
CURSOR_FILE = BASE_DIR / "backend" / ".evaluator_cursor"

client = None
try:
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY", "mock"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-12-01-preview"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "mock")
    )
except Exception:
    pass

def render_template(template_str, inputs, trace, var_mapping):
    """Render template replacing {{var}} with trace data based on var_mapping."""
    res = template_str
    
    def get_nested(d, path):
        keys = path.split('.')
        for k in keys:
            if isinstance(d, dict) and k in d:
                d = d[k]
            else:
                return ""
        return d

    for var in inputs:
        # Check mapping
        trace_path = var_mapping.get(var)
        if trace_path:
            # trace_path usually like 'trace.input' or 'span.retrieval.documents'
            # our trace is flat for input/output, but we'll try to find it
            val = ""
            if trace_path.startswith("trace."):
                val = get_nested(trace, trace_path.replace("trace.", ""))
            elif trace_path == "input":
                val = get_nested(trace, "input")
            elif trace_path == "output":
                val = get_nested(trace, "output")
            elif trace_path == "context" or path.endswith("documents"):
                val = get_nested(trace, "metadata.retrieved_context")
                
            res = res.replace("{{" + var + "}}", str(val))
    return res

async def evaluate_llm(prompt, model_name="gpt-4o-mini"):
    if not client or client.api_key == "mock":
        # Mock Response for Demo
        score = round(random.uniform(0.7, 1.0), 2)
        return {
            "score": score,
            "explanation": "Mock evaluation (Azure credentials missing)."
        }
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are an AI Evaluator. Output JSON only. Format: {\"score\": 0.0-1.0, \"explanation\": \"...\"}"},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"score": 0.0, "explanation": f"Error: {str(e)}"}

async def main():
    if not TRACE_FILE.exists():
        return
        
    # 1. Get active evaluators
    evaluators = query_db_dict("SELECT * FROM evaluators WHERE status = 'Active'")
    if not evaluators:
        return
        
    # Read templates and cache them
    templates_cache = {}
    for ev in evaluators:
        if ev["template_id"] not in templates_cache:
            tmpl = query_db_dict("SELECT * FROM templates WHERE id = ?", (ev["template_id"],))
            if tmpl:
                tmpl_data = tmpl[0]
                if isinstance(tmpl_data["inputs"], str):
                    try: tmpl_data["inputs"] = json.loads(tmpl_data["inputs"])
                    except: tmpl_data["inputs"] = []
                templates_cache[ev["template_id"]] = tmpl_data
                
        # Parse JSON fields
        if isinstance(ev["variable_mapping"], str):
            try: ev["variable_mapping"] = json.loads(ev["variable_mapping"])
            except: ev["variable_mapping"] = {}
        if isinstance(ev["execution"], str):
            try: ev["execution"] = json.loads(ev["execution"])
            except: ev["execution"] = {}

    # 2. Find where we left off
    last_processed = 0
    if CURSOR_FILE.exists():
        try:
            with open(CURSOR_FILE, "r") as f:
                last_processed = int(f.read().strip())
        except ValueError:
            pass

    # 3. Read new traces
    new_traces = []
    with open(TRACE_FILE, "r") as f:
        for i, line in enumerate(f):
            if i >= last_processed:
                if line.strip():
                    try:
                        new_traces.append((i, json.loads(line)))
                    except Exception:
                        pass
                last_processed = i + 1
                
    if not new_traces:
        return

    # 4. Evaluate
    for trace_idx, trace in new_traces:
        trace_id = trace.get("trace_id")
        if not trace_id: continue
        
        for ev in evaluators:
            execution = ev["execution"]
            
            # Requires context check
            requires_context = execution.get("requires_context", False)
            if requires_context:
                context = trace.get("metadata", {}).get("retrieved_context")
                if not context:
                    continue
                    
            # Sampling check
            sampling_rate = execution.get("sampling_rate", 1.0)
            if random.random() > float(sampling_rate):
                continue
                
            tmpl = templates_cache.get(ev["template_id"])
            if not tmpl:
                continue
                
            # Render prompt
            prompt = render_template(tmpl["template"], tmpl["inputs"], trace, ev["variable_mapping"])
            
            # Run evaluations (Ensemble mode if enabled)
            deployments = execution.get("ensemble_deployments", [tmpl.get("model", "gpt-4o")])
            if not execution.get("enable_ensemble", False) and len(deployments) > 0:
                deployments = [deployments[0]]
            if not deployments:
                deployments = ["gpt-4o-mini"]
                
            individual_scores = {}
            tasks = []
            for d in deployments:
                tasks.append(evaluate_llm(prompt, model_name=d))
                
            results = await asyncio.gather(*tasks)
            
            # Aggregate scores
            scores_list = []
            for i, d in enumerate(deployments):
                try:
                    s = float(results[i].get("score", 0.0))
                    individual_scores[d] = s
                    scores_list.append(s)
                except:
                    pass
                    
            if scores_list:
                ensemble_score = sum(scores_list) / len(scores_list)
                variance = sum((x - ensemble_score) ** 2 for x in scores_list) / len(scores_list) if len(scores_list) > 1 else 0.0
            else:
                ensemble_score = 0.0
                variance = 0.0
                
            variance_threshold = float(execution.get("variance_threshold", 0.1))
            unstable = variance > variance_threshold
            
            # Calculate mock cost & duration
            duration = random.randint(500, 2000)
            cost = 0.0001 * len(deployments)
            
            eval_id = f"{trace_id}:{ev['id']}"
            
            # Insert to DB
            query = """
            INSERT INTO evaluations (id, trace_id, evaluator_id, template_id, deployments_used, individual_scores, ensemble_score, variance, unstable, score, status, evaluation_cost_usd, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
            """
            execute_query(query, (
                eval_id,
                trace_id,
                ev["id"],
                tmpl["id"],
                json.dumps(deployments),
                json.dumps(individual_scores),
                ensemble_score,
                variance,
                unstable,
                ensemble_score,
                "Completed" if not unstable else "Unstable",
                cost,
                duration
            ))
            
    # Save cursor
    with open(CURSOR_FILE, "w") as f:
        f.write(str(last_processed))

if __name__ == "__main__":
    asyncio.run(main())
