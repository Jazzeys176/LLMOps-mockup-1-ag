import sys
import time
import subprocess
from pathlib import Path
from threading import Timer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class LogFileHandler(FileSystemEventHandler):
    """
    Watches for IN_MODIFY events on raw_trace_logs.jsonl.
    Uses a simple debounce timer to prevent spamming execution during burst writes.
    """
    def __init__(self, target_file, execute_script, debounce_seconds=1.0):
        super().__init__()
        self.target_file = target_file
        self.execute_script = execute_script
        self.debounce_seconds = debounce_seconds
        self._timer = None

    def on_modified(self, event):
        # We only care about modifications to the specific raw logs file
        if event.is_directory:
            return
            
        if event.src_path.endswith(self.target_file):
            self._queue_execution()

    def _queue_execution(self):
        # If a timer is already running, cancel it so we only trigger once after writes settle
        if self._timer is not None:
            self._timer.cancel()

        self._timer = Timer(self.debounce_seconds, self._run_normalization)
        self._timer.start()

    def _run_normalization(self):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Detected changes in {self.target_file}. Running normalization...")
        try:
            # We assume this script is run from the same directory as normalization.py
            subprocess.run([sys.executable, self.execute_script], check=True)
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Normalization complete.")
        except subprocess.CalledProcessError as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Normalization failed with exit code {e.returncode}")
        except Exception as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] An unexpected error occurred: {e}")

def main():
    backend_dir = Path(__file__).parent.resolve()
    target_file = "raw_trace_logs.jsonl"
    execute_script = "normalization.py"
    
    # Ensure standard trace file exists so the handler doesn't crash on the first run if it's missing
    output_target = backend_dir / "standard_trace_logs.jsonl"
    if not output_target.exists():
        output_target.touch()

    print(f"Starting Background Normalization Watcher...")
    print(f"Monitoring Directory: {backend_dir}")
    print(f"Monitoring Target:    {target_file}")
    print(f"Executing:            {execute_script}\n")

    event_handler = LogFileHandler(target_file, execute_script, debounce_seconds=1.0)
    
    # NEW handler for evaluations
    eval_target = "standard_trace_logs.jsonl"
    eval_script = "services/evaluator_runner.py"
    eval_handler = LogFileHandler(eval_target, eval_script, debounce_seconds=2.0)

    observer = Observer()
    # Schedule the observer to watch the backend directory recursively (or non-recursively)
    observer.schedule(event_handler, str(backend_dir), recursive=False)
    observer.schedule(eval_handler, str(backend_dir), recursive=False)
    observer.start()

    try:
        while True:
            # Main thread sleeps, letting the OS handle events via inotify
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nWatcher stopped gracefully.")
        
    observer.join()

if __name__ == "__main__":
    main()
