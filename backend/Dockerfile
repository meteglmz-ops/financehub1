FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port (Railway sets $PORT automatically)
EXPOSE 8000

# Start command
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
