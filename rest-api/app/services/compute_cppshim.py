# # app/services/compute_cppshim.py  (optional later)
# import os, ctypes, numpy as np
# from numpy.ctypeslib import ndpointer

# USE_CPP = os.getenv("USE_CPP") == "1"
# _lib = None

# if USE_CPP:
#     for p in (
#         os.path.join(os.path.dirname(__file__), "..", "..", "lib", "libriskcpp.so"),
#         "/app/lib/libriskcpp.so",
#     ):
#         if os.path.exists(p):
#             _lib = ctypes.CDLL(p)
#             break

# if _lib:
#     _lib.volatility_welford.argtypes = [ndpointer(ctypes.c_double), ctypes.c_int]
#     _lib.volatility_welford.restype  = ctypes.c_double
#     # ...add more signatures only for the functions you actually call...


# Then in your real compute.py, you’d:
# Try _lib functions if available,
# Else compute with NumPy,
# Else return a placeholder if you still haven’t implemented it.