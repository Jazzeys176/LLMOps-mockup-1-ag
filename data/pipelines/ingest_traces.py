# Databricks Notebook Source
from pyspark.sql.functions import col, current_timestamp, date_format
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, DoubleType, IntegerType, MapType

# Configuration
STORAGE_ACCOUNT = "mystorageaccount"
CONTAINER = "landing"
BASE_PATH = f"abfss://{CONTAINER}@{STORAGE_ACCOUNT}.dfs.core.windows.net/traces"
CHECKPOINT_PATH = f"abfss://{CONTAINER}@{STORAGE_ACCOUNT}.dfs.core.windows.net/checkpoints/traces"
TARGET_TABLE = "traces"

# Define Schema (to accept schema evolution)
schema = "trace_id STRING, timestamp TIMESTAMP, session_id STRING, trace_name STRING, user_id STRING, input STRING, output STRING, latency_ms DOUBLE, tokens_total INT, tokens_input INT, tokens_output INT, cost DOUBLE, model STRING, status STRING, metadata MAP<STRING, STRING>"

def upsert_to_delta(microBatchDF, batchId):
    microBatchDF.createOrReplaceTempView("updates")
    
    microBatchDF._jdf.sparkSession().sql(f"""
        MERGE INTO {TARGET_TABLE} t
        USING updates s
        ON t.trace_id = s.trace_id
        WHEN MATCHED THEN UPDATE SET *
        WHEN NOT MATCHED THEN INSERT *
    """)

# Auto Loader Read
df = (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", CHECKPOINT_PATH)
    .schema(schema)
    .load(BASE_PATH))

# Transformation
transformed_df = df.withColumn("ingestion_timestamp", current_timestamp())

# Write Stream (Upsert)
(transformed_df.writeStream
    .foreachBatch(upsert_to_delta)
    .option("checkpointLocation", CHECKPOINT_PATH)
    .trigger(processingTime="1 minute")
    .start())
