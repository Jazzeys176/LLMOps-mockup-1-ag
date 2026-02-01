from typing import List, Dict, Any
import math

class DriftDetector:
    def detect_distribution_drift(self, current: List[float], baseline: List[float], threshold: float = 0.1) -> Dict[str, Any]:
        """
        Simple distribution drift detection using mean/std comparison.
        (Replacing complex Scipy KS-test for simplicity in this demo, 
        but easy to swap in).
        """
        if not current or not baseline:
            return {"drift_detected": False, "score": 0.0}
            
        curr_mean = sum(current) / len(current)
        base_mean = sum(baseline) / len(baseline)
        
        # Calculate percentage change
        if base_mean == 0:
            pct_change = 0 if curr_mean == 0 else 1.0
        else:
            pct_change = abs(curr_mean - base_mean) / base_mean
            
        return {
            "drift_detected": pct_change > threshold,
            "score": pct_change,
            "current_mean": curr_mean,
            "baseline_mean": base_mean
        }
