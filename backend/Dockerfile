FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies for WeasyPrint and general build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    shared-mime-info \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements/base.txt

# Copy the Django project code
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port (Render sets PORT environment variable automatically)
EXPOSE 8000

# Start the application using the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
