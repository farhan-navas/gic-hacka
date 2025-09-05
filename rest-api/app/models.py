from pydantic import BaseModel
from typing import Optional
from datetime import date

# Response models for each API endpoint

class PortfolioPriceResponse(BaseModel):
    """Response model for /portfolio-price endpoint."""
    portfolioId: str
    date: str  # ISO date format
    price: float

# class DailyReturnResponse(BaseModel):
#     """Response model for /daily-return endpoint."""
#     portfolioId: str
#     date: str  # ISO date format
#     return_: float  # Using return_ since 'return' is a Python keyword
    
#     class Config:
#         # This allows the field to be serialized as 'return' in JSON
#         fields = {"return_": "return"}

class CumulativeReturnResponse(BaseModel):
    """Response model for /cumulative-return endpoint."""
    portfolioId: str
    cumulativeReturn: float

class DailyVolatilityResponse(BaseModel):
    """Response model for /daily-volatility endpoint."""
    portfolioId: str
    volatility: float

class CorrelationResponse(BaseModel):
    """Response model for /correlation endpoint."""
    portfolioId1: str
    portfolioId2: str
    correlation: float

class TrackingErrorResponse(BaseModel):
    """Response model for /tracking-error endpoint."""
    portfolioId: str
    benchmarkId: str
    trackingError: float