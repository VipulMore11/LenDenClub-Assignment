# Production Backend Dockerfile - LumaPay Django API

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy Django project
COPY backend/ .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run migrations and collect static files
RUN python manage.py migrate --noinput || true && \
    python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Start Gunicorn with production settings
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "sync", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
