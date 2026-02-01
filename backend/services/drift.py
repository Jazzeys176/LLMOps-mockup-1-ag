from typing import Dict, List, Any
import json
import os
from openai import AzureOpenAI
from ml.drift.detection import DriftDetector

class DriftService:
    def __init__(self):
        self.detector = DriftDetector()
        self.client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-12-01-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )

    async def check_drift_and_analyze(self, metric_name: str, current_data: List[float], baseline_data: List[float]) -> Dict[str, Any]:
        """
        Checks for drift and triggers RCA if detected.
        """
        drift_result = self.detector.detect_distribution_drift(current_data, baseline_data)
        
        if drift_result["drift_detected"]:
            # Trigger RCA
            rca = await self.generate_rca(metric_name, drift_result)
            drift_result["rca"] = rca
        
        return drift_result

    async def generate_rca(self, metric_name: str, drift_info: Dict) -> Dict[str, Any]:
        prompt = f"""
        You are an AI Site Reliability Engineer.
        Drift detected in metric: {metric_name}
        
        Stats:
        - Current Mean: {drift_info.get('current_mean')}
        - Baseline Mean: {drift_info.get('baseline_mean')}
        - Drift Score: {drift_info.get('score')}
        
        Analyze potential root causes for a manufacturing LLM assistant.
        Provide 3 potential causes and 3 recommendations.
        
        Return JSON: {{
            "root_causes": ["cause1", "cause2", "cause3"],
            "recommendations": ["rec1", "rec2", "rec3"],
            "severity": "high/medium/low"
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI RCA Agent. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"error": str(e)}
