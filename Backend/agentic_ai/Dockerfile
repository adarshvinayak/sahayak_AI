# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Set the working directory to root_agent where fastapi_endpoint.py is located
WORKDIR /app/root_agent

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Run the FastAPI application
CMD ["uvicorn", "fastapi_endpoint:app", "--host", "0.0.0.0", "--port", "8080"] 