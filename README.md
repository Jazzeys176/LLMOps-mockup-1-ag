# Smart Factory AI LLMOps Platform

## Overview
End-to-end LLMOps platform for manufacturing assistants, featuring:
- **Databricks Workflows** for ingestion and orchestration
- **Delta Lake** for high-performance storage and retrieval
- **Azure OpenAI** for evaluation (LLM-as-a-Judge) and Root Cause Analysis (RCA)
- **React Dashboard** for comprehensive observability and governance

## Architecture
- **Ingestion**: API -> ADLS Gen2 -> Databricks Auto Loader -> Delta Lake (Bronze)
- **Processing**: Databricks Workflows -> Delta Lake (Silver/Gold)
- **Intelligence**: Azure OpenAI serving Evaluators and Drift Analyzers
- **Consumption**: FastAPI Service -> Databricks SQL -> React Frontend

## Project Structure
- `backend/`: FastAPI services for ingestion, analytics, and management
- `frontend/`: React application (Observability Dashboard)
- `data/`: Databricks notebooks and SQL schemas
- `ml/`: Python modules for Evaluators and Drift Detection
- `infrastructure/`: Terraform and configuration scripts

## Getting Started
### Backend
```bash
make install
make run-backend
```

### Frontend
(Coming soon)
