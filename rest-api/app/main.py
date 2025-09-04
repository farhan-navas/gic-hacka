# from fastapi import FastAPI

# app = FastAPI()

# @app.get('/')
# def read_root():
#     return { "message": "Welcome!" }


from fastapi import FastAPI
from app.models import PlaceholderRequest, PlaceholderResponse
from app.services.compute import (
    placeholder_api1,
    placeholder_api2,
    placeholder_api3,
    placeholder_api4,
    placeholder_api5,
    placeholder_api6,
)

app = FastAPI(title="Risk Metrics API (Placeholders)", version="0.0.1")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/risk/api1", response_model=PlaceholderResponse)
def api1(req: PlaceholderRequest):
    out, _ = placeholder_api1(req.data)
    return out

@app.post("/risk/api2", response_model=PlaceholderResponse)
def api2(req: PlaceholderRequest):
    out, _ = placeholder_api2(req.data)
    return out

@app.post("/risk/api3", response_model=PlaceholderResponse)
def api3(req: PlaceholderRequest):
    out, _ = placeholder_api3(req.data)
    return out

@app.post("/risk/api4", response_model=PlaceholderResponse)
def api4(req: PlaceholderRequest):
    out, _ = placeholder_api4(req.data)
    return out

@app.post("/risk/api5", response_model=PlaceholderResponse)
def api5(req: PlaceholderRequest):
    out, _ = placeholder_api5(req.data)
    return out

@app.post("/risk/api6", response_model=PlaceholderResponse)
def api6(req: PlaceholderRequest):
    out, _ = placeholder_api6(req.data)
    return out
