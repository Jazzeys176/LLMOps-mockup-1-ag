# from fastapi import APIRouter, HTTPException, Depends
# from backend.models.trace import Trace
# from backend.services.ingestion import IngestionService
# import logging

# router = APIRouter(prefix="/api/v1/traces", tags=["traces"])
# logger = logging.getLogger(__name__)

# # Dependency Injection (Singleton-ish for now)
# ingestion_service = IngestionService()

# def get_ingestion_service():
#     return ingestion_service

# @router.post("/", status_code=202)
# async def create_trace(
#     trace: Trace,
#     service: IngestionService = Depends(get_ingestion_service)
# ):
#     """
#     Ingest a new trace event.
#     Writes asynchronously to ADLS for processing by Databricks Auto Loader.
#     """
#     try:
#         success = await service.ingest_trace(trace)
#         if not success:
#             raise HTTPException(status_code=500, detail="Failed to ingest trace to storage.")
#         return {"status": "accepted", "trace_id": trace.trace_id}
#     except Exception as e:
#         logger.error(f"Error creating trace: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/")
# async def list_traces():
#     # Placeholder: In real app, this would query Databricks SQL
#     return {"message": "Use Databricks SQL to query traces."}
