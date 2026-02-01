from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseEvaluator(ABC):
    @abstractmethod
    async def evaluate(self, trace_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a trace and return scores/metadata.
        Result schema: {"score": float, "explanation": str}
        """
        pass
