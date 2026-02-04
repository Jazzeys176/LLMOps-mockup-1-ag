# import os
# import json
# from datetime import datetime
# from azure.storage.filedatalake import DataLakeServiceClient
# from azure.identity import DefaultAzureCredential
# from backend.models.trace import Trace
# import logging

# logger = logging.getLogger(__name__)

# class IngestionService:
#     def __init__(self):
#         self.account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
#         self.container_name = os.getenv("AZURE_STORAGE_CONTAINER_LANDING", "landing")
        
#         # Check if we should use local storage (if account name is 'your_storage_account' placeholder or missing)
#         if self.account_name and self.account_name != "your_storage_account":
#             try:
#                 self.credential = DefaultAzureCredential()
#                 self.service_client = DataLakeServiceClient(
#                     account_url=f"https://{self.account_name}.dfs.core.windows.net",
#                     credential=self.credential
#                 )
#                 self.file_system_client = self.service_client.get_file_system_client(self.container_name)
#                 self.is_local = False
#             except Exception as e:
#                 logger.warning(f"Failed to init Azure Storage, falling back to local: {e}")
#                 self.is_local = True
#                 self._ensure_local_dir()
#         else:
#             logger.warning("AZURE_STORAGE_ACCOUNT_NAME not set or is placeholder. Using local storage.")
#             self.is_local = True
#             self._ensure_local_dir()

#     def _ensure_local_dir(self):
#         self.local_path = os.path.join(os.getcwd(), "data", "landing")
#         os.makedirs(self.local_path, exist_ok=True)

#     async def ingest_trace(self, trace: Trace) -> bool:
#         """
#         Writes a single trace event to ADLS Gen2 or Local Disk in JSON format.
#         Path: /traces/YYYY/MM/DD/trace_id.json
#         """
#         try:
#             # Construct path
#             date_path = trace.timestamp.strftime("%Y/%m/%d")
#             file_name = f"{trace.trace_id}.json"
            
#             # Serialize
#             data = trace.model_dump_json()

#             if not self.is_local and self.file_system_client:
#                  # Azure Path
#                 directory = f"traces/{date_path}"
#                 dir_client = self.file_system_client.get_directory_client(directory)
#                 if not dir_client.exists():
#                     dir_client.create_directory()
                
#                 file_client = dir_client.get_file_client(file_name)
#                 file_client.upload_data(data, overwrite=True)
#                 logger.info(f"Ingested trace {trace.trace_id} to Azure: {directory}/{file_name}")
#             else:
#                 # Local Path
#                 full_dir = os.path.join(self.local_path, "traces", date_path)
#                 os.makedirs(full_dir, exist_ok=True)
#                 full_path = os.path.join(full_dir, file_name)
                
#                 with open(full_path, "w") as f:
#                     f.write(data)
#                 logger.info(f"Ingested trace {trace.trace_id} to Local: {full_path}")
            
#             return True
            
#         except Exception as e:
#             logger.error(f"Failed to ingest trace {trace.trace_id}: {str(e)}")
#             raise e
