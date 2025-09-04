import hashlib
import numpy as np

def dataset_hash(arr: np.ndarray) -> str:
    return hashlib.sha256(arr.tobytes()).hexdigest()[:16]

def key_for(prefix: str, *parts) -> str:
    return prefix + "|" + "|".join(str(p) for p in parts)
