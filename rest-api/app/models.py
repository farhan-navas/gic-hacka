from pydantic import BaseModel
from typing import Optional, Dict, Any

# currently all 6 apis point to this placeholder request and response, customise each and change naming accordingly insid main.py!
class PlaceholderRequest(BaseModel):
    """Generic request body placeholder."""
    data: Optional[Dict[str, Any]] = None
    note: Optional[str] = None

class PlaceholderResponse(BaseModel):
    """Generic response body placeholder."""
    message: str = "TODO: implement"
    placeholder: bool = True
