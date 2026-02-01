from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize connections (placeholder)
    print("Starting Smart Factory AI LLMOps Platform Backend...")
    yield
    # Shutdown: Close connections
    print("Shutting down...")

app = FastAPI(
    title="Smart Factory AI LLMOps Platform API",
    description="Backend API for Ingestion, Analytics, and Governance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.api.routes import ingestion, analytics, evaluations, drift
app.include_router(ingestion.router)
app.include_router(analytics.router)
app.include_router(evaluations.router)
app.include_router(drift.router)


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify backend status.
    """
    return {
        "status": "healthy",
        "service": "smart-factory-backend",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {"message": "Smart Factory AI LLMOps Platform API is running."}
