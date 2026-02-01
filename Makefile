.PHONY: install run-backend test lint

install:
	pip install -r backend/requirements.txt

run-backend:
	uvicorn backend.api.main:app --reload --port 8000

test:
	pytest backend/tests

lint:
	flake8 backend
	black --check backend
