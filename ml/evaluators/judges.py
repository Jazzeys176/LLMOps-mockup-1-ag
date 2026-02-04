import os
import json
from typing import Dict, Any
from openai import AzureOpenAI
from ml.evaluators.base import BaseEvaluator

class LLMJudge(BaseEvaluator):
    def __init__(self, metric_name: str, model_name: str = "gpt-4o-mini"):
        self.metric_name = metric_name
        self.model_name = model_name
        
        try:
            self.client = AzureOpenAI(
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-12-01-preview"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
            )
        except Exception:
            print(f"Warning: Azure OpenAI credentials missing for {metric_name}. Using Mock Evaluator.")
            self.client = None
    
    async def evaluate(self, trace_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
             # Mock Response for Demo
            import random
            return {
                "score": round(random.uniform(0.7, 1.0), 2),
                "explanation": "Mock evaluation (Azure credentials missing)."
            }

        prompt = self._construct_prompt(trace_data)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an AI Evaluator. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"score": 0.0, "explanation": f"Error: {str(e)}"}

    def _construct_prompt(self, trace_data: Dict[str, Any]) -> str:
        input_text = trace_data.get("input", "")
        output_text = trace_data.get("output", "")
        context = trace_data.get("metadata", {}).get("retrieved_context", "")
        
        if self.metric_name == "hallucination":
            return f"""
            Evaluate if the response is hallucinated based on the context.
            Context: {context}
            Response: {output_text}
            
            Return JSON: {{"score": 0.0-1.0, "explanation": "reason"}}
            1.0 = No Hallucination (Fully grounded)
            0.0 = Complete Hallucination
            """
        elif self.metric_name == "context_relevance":
            return f"""
            Evaluate if the retrieved context is relevant to the input query.
            Query: {input_text}
            Context: {context}
            
            Return JSON: {{"score": 0.0-1.0, "explanation": "reason"}}
            1.0 = Highly Relevant
            0.0 = Irrelevant
            """
        elif self.metric_name == "conciseness":
            return f"""
            Evaluate if the response is concise and to the point.
            Response: {output_text}
            
            Return JSON: {{"score": 0.0-1.0, "explanation": "reason"}}
            1.0 = Very Concise
            0.0 = Verbose
            """
        return ""

class HallucinationEvaluator(LLMJudge):
    def __init__(self):
        super().__init__("hallucination")

class ContextRelevanceEvaluator(LLMJudge):
    def __init__(self):
        super().__init__("context_relevance")

class ConcisenessEvaluator(LLMJudge):
    def __init__(self):
        super().__init__("conciseness")
