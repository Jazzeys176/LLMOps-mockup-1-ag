"""
Metrics Worker

Background worker that updates metrics.json every 10 seconds.
Uses the `schedule` library for simple periodic execution.

Usage:
    cd backend
    python -m workers.metrics_worker
"""

import sys
import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

try:
    import schedule
except ImportError:
    print("Error: 'schedule' library not found. Install with: pip install schedule")
    sys.exit(1)

from backend.services.metrics_aggregator import write_metrics_atomic


def run_aggregation():
    """Run metrics aggregation."""
    try:
        metrics = write_metrics_atomic()
        print(f"[{metrics['computed_at']}] Metrics updated: {metrics['total_traces']} traces, ${metrics['total_cost']:.6f} total cost")
    except Exception as e:
        print(f"Error updating metrics: {e}")


def main():
    """Main worker loop."""
    print("=" * 60)
    print("Metrics Worker Started")
    print("Updates metrics.json every 10 seconds")
    print("Press Ctrl+C to stop")
    print("=" * 60)

    # Run immediately on start
    run_aggregation()

    # Schedule to run every 10 seconds
    schedule.every(10).seconds.do(run_aggregation)

    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nMetrics Worker stopped.")


if __name__ == "__main__":
    main()
