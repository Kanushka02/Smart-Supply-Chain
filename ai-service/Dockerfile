# =============================================================================
# Production Dockerfile for Python FastAPI AI Demand Forecasting Microservice
# =============================================================================
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set Python environment flags: prevents writing .pyc files and unbuffers logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy dependency definition
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code, datasets, and trained model artifacts
COPY app ./app
COPY data ./data
COPY models ./models
COPY services ./services
COPY main.py ./

# Expose FastAPI microservice port
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
