FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/board-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/board-service /app

EXPOSE 8001

CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8001"]