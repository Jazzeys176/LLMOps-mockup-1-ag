import os
import json
from datetime import datetime
from azure.storage.filedatalake import DataLakeServiceClient
from azure.identity import DefaultAzureCredential
from backend.models.trace import Trace
import logging

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self):
        self.account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER_LANDING", "landing")
        self.credential = DefaultAzureCredential()
        
        if self.account_name:
            self.service_client = DataLakeServiceClient(
                account_url=f"https://{self.account_name}.dfs.core.windows.net",
                credential=self.credential
            )
            self.file_system_client = self.service_client.get_file_system_client(self.container_name)
        else:
            logger.warning("AZURE_STORAGE_ACCOUNT_NAME not set. Ingestion will fail.")
            self.file_system_client = None

    async def ingest_trace(self, trace: Trace) -> bool:
        """
        Writes a single trace event to ADLS Gen2 in JSON format.
        Path: /traces/YYYY/MM/DD/trace_id.json
        """
        if not self.file_system_client:
            logger.error("Storage client not initialized.")
            return False

        try:
            # Construct path
            date_path = trace.timestamp.strftime("%Y/%m/%d")
            file_name = f"{trace.trace_id}.json"
            directory = f"traces/{date_path}"
            
            # Serialize
            data = trace.model_dump_json()
            
            # Get directory client (create if not exists)
            dir_client = self.file_system_client.get_directory_client(directory)
            if not dir_client.exists():
                dir_client.create_directory()
            
            # Create file
            file_client = dir_client.get_file_client(file_name)
            file_client.upload_data(data, overwrite=True)
            
            logger.info(f"Ingested trace {trace.trace_id} to {directory}/{file_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to ingest trace {trace.trace_id}: {str(e)}")
            raise e
