FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv export --format requirements-txt > requirements.txt
RUN python -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

ENV PATH="/opt/venv/bin:${PATH}"

COPY app/ ./app/
EXPOSE 8080
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8080","--workers","2"]

## dockerfile from chat
# ---- Build C++ library
# FROM debian:stable-slim AS cppbuild
# RUN apt-get update && apt-get install -y --no-install-recommends g++ make && rm -rf /var/lib/apt/lists/*
# WORKDIR /src
# COPY riskcpp/risk.cpp ./risk.cpp
# RUN g++ -O3 -march=native -ffast-math -fPIC -shared risk.cpp -o /out/libriskcpp.so

# # ---- Python runtime
# FROM python:3.13-slim AS app
# ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY app/ ./app/

# # Copy compiled C++ lib
# RUN mkdir -p /app/lib
# COPY --from=cppbuild /out/libriskcpp.so /app/lib/libriskcpp.so
# EXPOSE 8080
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
