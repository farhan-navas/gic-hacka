import numpy as np
from numba import njit

# --------------------------
# 1. Portfolio Price
# --------------------------
@njit
def compute_portfolio_price(rows):
    if not rows:
        return None
    return np.sum([q * c for q, c in rows])


# --------------------------
# 2. Daily Return
# --------------------------
@njit
def compute_daily_return(rows):
    if len(rows) < 2:
        return None, None
    dates, prices = zip(*rows)
    prices = np.array(prices, dtype=np.float64)
    returns = np.diff(prices) / prices[:-1]
    return dates[1:], returns.tolist()


# --------------------------
# 3. Cumulative Return
# --------------------------
@njit
def compute_cumulative_return(rows):
    if not rows:
        return None, None
    dates, prices = zip(*rows)
    prices = np.array(prices, dtype=np.float64)
    base = prices[0]
    cumulative = prices / base - 1.0
    return dates, cumulative.tolist()


# --------------------------
# 4. Daily Volatility
# --------------------------
@njit
def compute_volatility(rows):
    if len(rows) < 2:
        return None
    _, prices = zip(*rows)
    prices = np.array(prices, dtype=np.float64)
    returns = np.diff(prices) / prices[:-1]
    return float(np.std(returns, ddof=1))


# --------------------------
# 5. Correlation
# --------------------------
@njit
def compute_correlation(port_rows, bmk_rows):
    if len(port_rows) < 2 or len(bmk_rows) < 2:
        return None
    _, prices = zip(*port_rows)
    port_returns = np.diff(np.array(prices, dtype=np.float64)) / np.array(prices[:-1], dtype=np.float64)
    bmk_returns = np.array([r[1] for r in bmk_rows], dtype=np.float64)
    n = min(len(port_returns), len(bmk_returns))
    return float(np.corrcoef(port_returns[:n], bmk_returns[:n])[0, 1])


# --------------------------
# 6. Tracking Error
# --------------------------
@njit
def compute_tracking_error(port_rows, bmk_rows):
    if len(port_rows) < 2 or len(bmk_rows) < 2:
        return None
    _, prices = zip(*port_rows)
    port_returns = np.diff(np.array(prices, dtype=np.float64)) / np.array(prices[:-1], dtype=np.float64)
    bmk_returns = np.array([r[1] for r in bmk_rows], dtype=np.float64)
    n = min(len(port_returns), len(bmk_returns))
    diff = port_returns[:n] - bmk_returns[:n]
    return float(np.std(diff, ddof=1))
