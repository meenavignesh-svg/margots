FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements-gateway.txt .
RUN pip install --no-cache-dir -r requirements-gateway.txt
COPY . .
COPY core ./core
EXPOSE 8000
CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8000"]
