FROM python:3.12-slim

WORKDIR /app

# Cài dependencies trước để tận dụng cache Docker layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy mã nguồn
COPY app ./app

# Thư mục chứa SQLite (được mount volume trong docker-compose)
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
