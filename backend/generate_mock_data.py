import random
import string
import json
import duckdb
import pandas as pd
from datetime import datetime, timezone, timedelta
from pathlib import Path

# --- Configuration & Constants ---
ROOT_DIR = Path(__file__).resolve().parents[0]
DB_PATH = ROOT_DIR / "analytics.db"

# Model Costs per token: (input_cost, output_cost)
MODEL_PRICING = {
    "gpt-4o-mini": (0.00000015, 0.00000060),
    "gpt-4o": (0.00000250, 0.00001000),
    "claude-4-sonnet": (0.00000300, 0.00001500)
}

# Aligned Data Bank: Mapping Trace Names directly to their specific context
DATA_SAMPLES = [
    # {
    #     "trace_name": "Isolation Protocol",
    #     "input": "Explain valve shutdown procedure", 
    #     "output": "The valve shutdown procedure includes isolation, lockout, and safety steps."
    # },
    {
        "trace_name": "Anomaly Diagnosis",
        "input": "What caused temperature spike?", 
        "output": "Temperature spikes are mitigated by cooling system checks and emergency protocols."
    },
    # {
    #     "trace_name": "Downtime Investigation",
    #     "input": "Why did machine stop?", 
    #     "output": "Machine stoppage can occur due to motor failure or power issues."
    # },
    {
        "trace_name": "Inventory Audit",
        "input": "Check current inventory for raw steel coils", 
        "output": "Current stock shows 15 Grade-A steel coils remaining, which is below the reorder threshold of 20."
    },
    {
        "trace_name": "Shift Handover Summary",
        "input": "Summarize the morning shift handover notes", 
        "output": "Morning shift completed 450 units. Reported minor vibration on Conveyor B; maintenance is scheduled for 2:00 PM."
    },
    # {
    #     "trace_name": "Safety Emergency Protocol",
    #     "input": "What is the procedure for a chemical spill in Zone 4?", 
    #     "output": "Evacuate non-essential personnel, activate the ventilation system, and use the neutralizing agent located in Station 4B."
    # },
    {
        "trace_name": "Energy Efficiency Analysis",
        "input": "Analyze power consumption for Line 3", 
        "output": "Line 3 is currently drawing 45kW, showing a 12% increase compared to baseline. Recommend checking motor efficiency."
    },
    # {
    #     "trace_name": "Equipment Calibration",
    #     "input": "How to calibrate the robotic arm sensors?", 
    #     "output": "Enter manual override mode, reset to home position, and follow the laser alignment guide in the SOP manual."
    # },
    # {
    #     "trace_name": "Quality Assurance Check",
    #     "input": "Identify non-conforming parts in the last batch", 
    #     "output": "Batch #902 had a 3% rejection rate due to surface scratches. Most defects occurred during the polishing stage."
    # },
    # {
    #     "trace_name": "Preventive Maintenance Schedule",
    #     "input": "When is the next preventive maintenance for the hydraulic press?", 
    #     "output": "The hydraulic press is scheduled for inspection in 48 operating hours or by Friday morning."
    # }
]

def generate_alphanumeric(length=10):
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))

def calculate_cost(model, tokens_in, tokens_out):
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o-mini"])
    return (tokens_in * pricing[0]) + (tokens_out * pricing[1])

def get_eval_mapping():
    return random.choice([
        ("hallucination detection", "hallucination"),
        ("Conciseness", "accuracy"),
        ("Context Relevance", "contextrel")
    ])

def generate_data(num_sessions=10):
    all_traces, all_sessions, all_evals = [], [], []
    
    for i in range(num_sessions):
        session_id = f"session_{generate_alphanumeric(8)}"
        user_id = f"user_{random.randint(0, 999)}"
        num_traces = random.randint(3, 10)
        s_tokens, s_cost, s_start, s_end = 0, 0.0, None, None

        for t_idx in range(num_traces):
            is_first = (t_idx == 0)
            is_accurate = random.random() < 0.88 if is_first else random.random() < 0.60
            model = random.choice(list(MODEL_PRICING.keys()))
            
            trace_id = f"trace_{generate_alphanumeric(12)}"
            ts = datetime.now(timezone.utc) + timedelta(seconds=t_idx*30)
            
            # Key Change: Select the whole object so Trace Name matches the Input/Output
            sample = random.choice(DATA_SAMPLES)
            
            tokens_in, tokens_out = random.randint(300, 800), random.randint(500, 4000)
            cost = calculate_cost(model, tokens_in, tokens_out)
            
            all_traces.append({
                "trace_id": trace_id, 
                "timestamp": ts, 
                "session_id": session_id,
                "trace_name": sample["trace_name"], # Now contextually correct
                "user_id": user_id,
                "input": sample["input"], 
                "output": sample["output"] if is_accurate else "I encountered an error retrieving factory specifics.",
                "latency_ms": float(random.randint(400, 3500)), 
                "tokens_total": tokens_in + tokens_out,
                "tokens_input": tokens_in, 
                "tokens_output": tokens_out, 
                "cost": cost,
                "model": model, 
                "status": "Success", 
                "metadata": json.dumps({"env": "prod"}),
                "created_at": ts
            })
            
            s_tokens += (tokens_in + tokens_out)
            s_cost += cost
            if is_first: s_start = ts
            s_end = ts

            if is_first or random.random() > 0.5:
                eval_name, score_name = get_eval_mapping()
                s_val = 1.0 if is_accurate else 0.0
                if score_name == "hallucination": s_val = 0.0 if is_accurate else 1.0
                
                all_evals.append({
                    "evaluation_id": f"eval_{generate_alphanumeric(8)}", 
                    "trace_id": trace_id,
                    "evaluator_name": eval_name, 
                    "evaluator_version": "2.1.0",
                    "score_name": score_name, 
                    "score_value": float(s_val),
                    "score_metadata": json.dumps({"source": "auto"}), 
                    "duration_ms": float(random.randint(200, 800)),
                    "status": "Completed", 
                    "timestamp": ts + timedelta(seconds=5)
                })

        all_sessions.append({
            "session_id": session_id, 
            "user_id": user_id, 
            "trace_count": num_traces,
            "total_tokens": s_tokens, 
            "total_cost": s_cost, 
            "created_at": s_start,
            "last_activity": s_end, 
            "metadata": json.dumps({"type": "industrial"})
        })

    return all_sessions, all_traces, all_evals

if __name__ == "__main__":
    new_sessions, new_traces, new_evals = generate_data(num_sessions=10)
    
    con = duckdb.connect(str(DB_PATH))
    
    def append_to_table(table_name, data):
        df = pd.DataFrame(data)
        exists = con.execute(f"SELECT count(*) FROM information_schema.tables WHERE table_name = '{table_name}'").fetchone()[0]
        if exists:
            con.execute(f"INSERT INTO {table_name} SELECT * FROM df")
            print(f"  -> Appended {len(df)} rows to '{table_name}'")
        else:
            con.execute(f"CREATE TABLE {table_name} AS SELECT * FROM df")
            print(f"  -> Created table '{table_name}' with {len(df)} rows")

    print(f"Updating {DB_PATH}...")
    append_to_table("sessions", new_sessions)
    append_to_table("traces", new_traces)
    append_to_table("evaluations", new_evals)
    
    con.close()
    print("✅ Sync complete. Trace names are now contextually mapped to inputs.")