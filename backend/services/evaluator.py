from typing import Dict, List
import asyncio
from ml.evaluators.judges import HallucinationEvaluator, ContextRelevanceEvaluator, ConcisenessEvaluator

class EvaluatorService:
    def __init__(self):
        self.evaluators = {
            "hallucination": HallucinationEvaluator(),
            "context_relevance": ContextRelevanceEvaluator(),
            "conciseness": ConcisenessEvaluator()
        }

    async def run_evaluation(self, trace_data: Dict) -> Dict[str, Dict]:
        """
        Runs all configured evaluators in parallel.
        """
        results = {}
        tasks = []
        names = []
        
        for name, evaluator in self.evaluators.items():
            names.append(name)
            tasks.append(evaluator.evaluate(trace_data))
        
        eval_results = await asyncio.gather(*tasks)
        
        for name, result in zip(names, eval_results):
            results[name] = result
            
        return results
