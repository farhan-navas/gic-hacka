from fastapi import FastAPI, HTTPException
from psycopg2.pool import SimpleConnectionPool
from services.compute import (
    compute_portfolio_price, compute_daily_return, compute_cumulative_return,
    compute_volatility, compute_correlation, compute_tracking_error
)

from db.config import DB_CONFIG

min_connections = 1
max_connections = 10

DSN = "dbname=your_db user=your_user password=your_password host=your_host port=5432"

pool = None
app = FastAPI(title="GIC Risk Metrics API", version="1.0")

@app.on_event("startup")
def startup():
    global pool
    pool = SimpleConnectionPool(min_connections, max_connections, **DB_CONFIG)
    
@app.on_event("shutdown")
def shutdown():
    if pool:
        pool.closeall()

def fetch_all(query, params=None):
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params or [])
            rows = cur.fetchall()
        return rows
    finally:
        pool.putconn(conn)

# --------------------------
# Endpoints
# --------------------------
@app.get("/metrics/portfolio_price")
def portfolio_price(portfolio_id: int, date: str):
    rows = fetch_all(
        """SELECT h.quantity, p.closing_price
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date = %s""",
        (portfolio_id, date),
    )
    price = compute_portfolio_price(rows)
    if price is None:
        raise HTTPException(status_code=404, detail="No data found")
    return {"portfolio_id": portfolio_id, "date": date, "portfolio_price": price}

@app.get("/metrics/daily_return")
def daily_return(portfolio_id: int, start_date: str, end_date: str):
    rows = fetch_all(
        """SELECT h.date, SUM(h.quantity * p.closing_price) AS portfolio_value
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date BETWEEN %s AND %s
           GROUP BY h.date ORDER BY h.date ASC""",
        (portfolio_id, start_date, end_date),
    )
    dates, returns = compute_daily_return(rows)
    if returns is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolio_id, "dates": dates, "daily_returns": returns}

@app.get("/metrics/cumulative_return")
def cumulative_return(portfolio_id: int, start_date: str, end_date: str):
    rows = fetch_all(
        """SELECT h.date, SUM(h.quantity * p.closing_price) AS portfolio_value
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date BETWEEN %s AND %s
           GROUP BY h.date ORDER BY h.date ASC""",
        (portfolio_id, start_date, end_date),
    )
    dates, cumulative = compute_cumulative_return(rows)
    if cumulative is None:
        raise HTTPException(status_code=404, detail="No data found")
    return {"portfolio_id": portfolio_id, "dates": dates, "cumulative_returns": cumulative}

@app.get("/metrics/volatility")
def volatility(portfolio_id: int, start_date: str, end_date: str):
    rows = fetch_all(
        """SELECT h.date, SUM(h.quantity * p.closing_price) AS portfolio_value
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date BETWEEN %s AND %s
           GROUP BY h.date ORDER BY h.date ASC""",
        (portfolio_id, start_date, end_date),
    )
    vol = compute_volatility(rows)
    if vol is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date, "volatility": vol}

@app.get("/metrics/correlation")
def correlation(portfolio_id: int, bmk_id: int, start_date: str, end_date: str):
    port_rows = fetch_all(
        """SELECT h.date, SUM(h.quantity * p.closing_price) AS portfolio_value
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date BETWEEN %s AND %s
           GROUP BY h.date ORDER BY h.date ASC""",
        (portfolio_id, start_date, end_date),
    )
    bmk_rows = fetch_all(
        """SELECT date, bmk_returns
           FROM benchmark
           WHERE bmk_id = %s AND portfolio_id = %s
           AND date BETWEEN %s AND %s
           ORDER BY date ASC""",
        (bmk_id, portfolio_id, start_date, end_date),
    )
    corr = compute_correlation(port_rows, bmk_rows)
    if corr is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolio_id, "bmk_id": bmk_id, "correlation": corr}

@app.get("/metrics/tracking_error")
def tracking_error(portfolio_id: int, bmk_id: int, start_date: str, end_date: str):
    port_rows = fetch_all(
        """SELECT h.date, SUM(h.quantity * p.closing_price) AS portfolio_value
           FROM holdings h
           JOIN prices p ON h.symbol = p.symbol AND h.date = p.date
           WHERE h.portfolio_id = %s AND h.date BETWEEN %s AND %s
           GROUP BY h.date ORDER BY h.date ASC""",
        (portfolio_id, start_date, end_date),
    )
    bmk_rows = fetch_all(
        """SELECT date, bmk_returns
           FROM benchmark
           WHERE bmk_id = %s AND portfolio_id = %s
           AND date BETWEEN %s AND %s
           ORDER BY date ASC""",
        (bmk_id, portfolio_id, start_date, end_date),
    )
    te = compute_tracking_error(port_rows, bmk_rows)
    if te is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolio_id, "bmk_id": bmk_id, "tracking_error": te}

@app.get("/health")
def health():
    return {"status": "ok"}

