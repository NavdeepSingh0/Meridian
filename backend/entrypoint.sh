#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

# Render sets the PORT environment variable. If not set, default to 8000
PORT=${PORT:-8000}

echo "Starting Gunicorn server on port $PORT..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2
