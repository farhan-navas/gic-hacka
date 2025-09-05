from contextlib import asynccontextmanager
import logging, time, os

from fastapi import FastAPI, HTTPException, Request, Query
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date as Date, datetime, timedelta
from fastapi.responses import JSONResponse

import numpy as np

from services.compute import (
    compute_daily_return, compute_cumulative_return,
    compute_volatility, compute_correlation, compute_tracking_error
)

from models import (
    PortfolioPriceResponse, CorrelationResponse, CumulativeReturnResponse, 
    DailyVolatilityResponse, TrackingErrorResponse
)

from bisect import bisect_left, bisect_right
from db.config import DB_CONFIG

log = logging.getLogger("portfolio-cache")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# This will be populated at startup and remain static until restart
PORTFOLIO_PRICE_CACHE: dict[int, dict] = {}
CACHE_BUILD_STATS = {"portfolios": 0, "dates": 0, "seconds": 0.0}
DATE_FORMAT_STRING = "%Y-%m-%d"

def _load_all_prices():
    """Connects to Postgres, computes portfolio prices, returns nested dict."""
    # ---- replace with your real credentials / config
    conn = psycopg2.connect(**DB_CONFIG)

    try:
        # --- Load portfolio hierarchy (small result set; use RealDictCursor) ---
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT portfolio_id, portfolio_type, parent_portfolio_id FROM portfolios;")
            portfolios = cur.fetchall()

        ptype = {r["portfolio_id"]: str(r["portfolio_type"]).strip().lower() for r in portfolios}
        children = {r["portfolio_id"]: [] for r in portfolios}
        for r in portfolios:
            if r["parent_portfolio_id"] is not None:
                children.setdefault(r["parent_portfolio_id"], []).append(r["portfolio_id"])

        # prepare cache
        cache: dict[int, dict] = {}

        # ensure every leaf exists in cache even if it has no holdings
        for pid, t in ptype.items():
            if t == "leaf":
                cache.setdefault(pid, {})

        # --- (3) Pre-aggregate all LEAF portfolio prices in the DB and (2) stream them ---
        # Server-side cursor (named) to avoid loading everything at once.
        leaf_sql = """
            SELECT h.portfolio_id, h.date, SUM(h.quantity * p.closing_price) AS price
            FROM holdings h
            JOIN prices p ON p.symbol = h.symbol AND p.date = h.date
            JOIN portfolios prt ON prt.portfolio_id = h.portfolio_id
            WHERE lower(prt.portfolio_type) = 'leaf'
            GROUP BY h.portfolio_id, h.date
            ORDER BY h.portfolio_id, h.date
        """
        scur = conn.cursor(name="leaf_prices_stream")  # server-side cursor
        scur.itersize = 10_000                         # (2) stream in 10k-row batches
        scur.execute(leaf_sql)

        while True:
            batch = scur.fetchmany(10_000)
            if not batch:
                break
            # rows are tuples: (portfolio_id, date, price)
            for pid, dt, price in batch:
                cache.setdefault(pid, {})[dt.isoformat()] = float(price)

        scur.close()

        # --- Compute SUMMARY portfolios bottom-up by aggregating child prices ---
        processed = {pid for pid, t in ptype.items() if t == "leaf"}
        while True:
            progressed = False
            for pid, t in ptype.items():
                if t != "summary" or pid in processed:
                    continue
                kids = children.get(pid, [])
                # wait until all children are present in cache
                if any(k not in cache for k in kids):
                    continue
                combined = {}
                for k in kids:
                    for dt, v in cache.get(k, {}).items():
                        combined[dt] = combined.get(dt, 0.0) + v
                cache[pid] = combined
                processed.add(pid)
                progressed = True
            if not progressed:
                break

        return cache

    finally:
        conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    t0 = time.perf_counter()
    log.info("🔄 Building portfolio price cache on startup…")
    try:
        cache = _load_all_prices()
        PORTFOLIO_PRICE_CACHE.clear()
        PORTFOLIO_PRICE_CACHE.update(cache)

        # compute a few stats for easy debug
        all_dates = set()
        for d in PORTFOLIO_PRICE_CACHE.values():
            all_dates.update(d.keys())
        dt = time.perf_counter() - t0
        CACHE_BUILD_STATS.update({
            "portfolios": len(PORTFOLIO_PRICE_CACHE),
            "dates": len(all_dates),
            "seconds": round(dt, 3),
        })
        log.info(
            f"✅ Cache ready: {CACHE_BUILD_STATS['portfolios']} portfolios,"
            f" {CACHE_BUILD_STATS['dates']} dates in {CACHE_BUILD_STATS['seconds']}s"
        )
    except Exception as e:
        log.exception("❌ Cache build failed: %s", e)
    yield
    # nothing to clean up on shutdown


app = FastAPI(title="GIC Risk Metrics API", version="1.0", lifespan=lifespan)

# --------------------------
# Endpoints
# --------------------------
@app.get("/portfolio-price", response_model=PortfolioPriceResponse)
def portfolio_price(
    portfolioId: str = Query(), 
    date: str = Query()
):
    price = PORTFOLIO_PRICE_CACHE[int(portfolioId)][date]

    if price is None:
        raise HTTPException(status_code=404, detail="No data found")

    return {"portfolioId": portfolioId, "date": date, "price": price}

@app.get("/daily-return")
def daily_return(
    portfolioId: str = Query(), 
    date: str = Query()
):
    date_yesterday = (datetime.strptime(date, DATE_FORMAT_STRING) - timedelta(days=1)).strftime(DATE_FORMAT_STRING)

    price_today = PORTFOLIO_PRICE_CACHE[int(portfolioId)][date]
    price_yesterday = PORTFOLIO_PRICE_CACHE[int(portfolioId)][date_yesterday]

    returns = (price_today - price_yesterday) / price_yesterday

    if returns is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    
    return {"portfolioId": portfolioId, "date": date, "return": returns}

@app.get("/cumulative-return", response_model=CumulativeReturnResponse)
def cumulative_return(
    portfolioId: str = Query(),
    startDate: str = Query(),
    endDate: str = Query()
):  
    try: 
        Date.fromisoformat(startDate)
        Date.fromisoformat(endDate)
    except ValueError:
        raise HTTPException(status_code=400, detail="startDate/endDate must be YYYY-MM-DD")
        
    if startDate > endDate:
        raise HTTPException(status_code=400, detail="startDate must be <= endDate")

    mp = PORTFOLIO_PRICE_CACHE.get(int(portfolioId))
    if not mp:
        raise HTTPException(status_code=404, detail="Unknown portfolioId or no prices cached")

    dates_sorted = sorted(mp.keys())

    lo = bisect_left(dates_sorted, startDate)
    hi = bisect_right(dates_sorted, endDate)

    if lo == 0:
        raise HTTPException(
            status_code=400,
            detail="No prior trading day before startDate to form the base price."
        )
    if hi <= lo:
        raise HTTPException(status_code=404, detail="No trading dates within the given range")

    # base is previous trading day (start is inclusive per spec)
    base_date = dates_sorted[lo - 1]
    prev_price = mp.get(base_date)
    if prev_price is None or float(prev_price) == 0.0:
        raise HTTPException(status_code=400, detail="Missing/zero base price before startDate")

    # walk from first day in range to last day in range
    cumulative = 1.0
    for d in dates_sorted[lo:hi]:
        p = mp.get(d)
        if p is None:
            raise HTTPException(status_code=500, detail=f"Missing price for {d}")
        prev = float(prev_price)
        r = (float(p) - prev) / prev
        cumulative *= (1.0 + r)
        prev_price = p

    return {"portfolioId": portfolioId, "cumulativeReturn": float(cumulative - 1.0)}

@app.get("/daily-volatility", response_model=DailyVolatilityResponse)
def volatility(
    portfolioId: str = Query(...),
    startDate: str = Query(...),
    endDate: str = Query(...),
):
    try:
        Date.fromisoformat(startDate)
        Date.fromisoformat(endDate)
    except ValueError:
        raise HTTPException(status_code=400, detail="startDate/endDate must be YYYY-MM-DD")
    if startDate > endDate:
        raise HTTPException(status_code=400, detail="startDate must be <= endDate")

    mp = PORTFOLIO_PRICE_CACHE.get(int(portfolioId))
    if not mp:
        raise HTTPException(status_code=404, detail="Unknown portfolioId or no prices cached")

    dates_sorted = sorted(mp.keys())

    lo = bisect_left(dates_sorted, startDate)
    hi = bisect_right(dates_sorted, endDate)
    if lo == 0:
        raise HTTPException(status_code=400, detail="No prior trading day before startDate to form base price")
    if hi <= lo:
        raise HTTPException(status_code=404, detail="No trading dates within the given range")

    base_date = dates_sorted[lo - 1]
    prev_price = mp.get(base_date)
    if prev_price is None or float(prev_price) == 0.0:
        raise HTTPException(status_code=400, detail="Missing/zero base price before startDate")

    returns = []
    for d in dates_sorted[lo:hi]:
        p = mp.get(d)
        if p is None:
            raise HTTPException(status_code=500, detail=f"Missing price for {d}")
        p = float(p)
        prev = float(prev_price)
        r = (p - prev) / prev
        returns.append(r)
        prev_price = p

    N = len(returns)
    if N < 2:
        raise HTTPException(status_code=400, detail="Not enough data: need at least 2 daily returns")

    r = np.array(returns, dtype=float)
    vol = float(np.sqrt(r.var(ddof=1))) # one shot

    return {"portfolioId": portfolioId, "volatility": vol}

@app.get("/correlation", response_model=CorrelationResponse)
def correlation(
    portfolioId1: str = Query(...),
    portfolioId2: str = Query(...),
    startDate: str = Query(...),
    endDate: str = Query(...),
):
    try:
        Date.fromisoformat(startDate)
        Date.fromisoformat(endDate)
    except ValueError:
        raise HTTPException(status_code=400, detail="startDate/endDate must be YYYY-MM-DD")
    if startDate > endDate:
        raise HTTPException(status_code=400, detail="startDate must be <= endDate")

    mp1 = PORTFOLIO_PRICE_CACHE.get(int(portfolioId1))
    mp2 = PORTFOLIO_PRICE_CACHE.get(int(portfolioId2))
    if not mp1 or not mp2:
        raise HTTPException(status_code=404, detail="Unknown portfolioId(s) or no prices cached")

    d1 = sorted(mp1.keys()) 
    d2 = sorted(mp2.keys())

    # window bounds
    lo1, hi1 = bisect_left(d1, startDate), bisect_right(d1, endDate)
    lo2, hi2 = bisect_left(d2, startDate), bisect_right(d2, endDate)
    if hi1 <= lo1 or hi2 <= lo2:
        raise HTTPException(status_code=404, detail="No trading dates within the given range")

    # per spec, need a price from the trading day BEFORE start to compute the first return
    if lo1 == 0 or lo2 == 0:
        raise HTTPException(status_code=400, detail="Missing prior trading day before startDate for one or both portfolios")

    # --- build daily returns in window (using previous trading day's price) ---
    r1 = {}
    for i in range(lo1, hi1):
        prev_p = float(mp1[d1[i - 1]])
        cur_p  = float(mp1[d1[i]])
        if prev_p == 0:
            raise HTTPException(status_code=400, detail="Zero base price encountered in portfolio 1")
        r1[d1[i]] = (cur_p - prev_p) / prev_p

    r2 = {}
    for i in range(lo2, hi2):
        prev_p = float(mp2[d2[i - 1]])
        cur_p  = float(mp2[d2[i]])
        if prev_p == 0:
            raise HTTPException(status_code=400, detail="Zero base price encountered in portfolio 2")
        r2[d2[i]] = (cur_p - prev_p) / prev_p

    # --- align on overlapping dates ---
    common = sorted(set(r1.keys()) & set(r2.keys()))
    if len(common) < 2:  # need at least 2 paired observations
        raise HTTPException(status_code=400, detail="Not enough overlapping daily returns to compute correlation")

    x = np.array([r1[d] for d in common], dtype=float)
    y = np.array([r2[d] for d in common], dtype=float)

    # --- correlation via centered sums (matches slide formula) ---
    x_c = x - x.mean()
    y_c = y - y.mean()
    num = float((x_c * y_c).sum())
    den = float(np.sqrt((x_c * x_c).sum()) * np.sqrt((y_c * y_c).sum()))
    if den == 0.0:
        raise HTTPException(status_code=400, detail="One series has zero variance; correlation undefined")

    corr = num / den

    return {"portfolioId1": portfolioId1, "portfolioId2": portfolioId2, "correlation": float(corr)}

@app.get("/tracking-error", response_model=TrackingErrorResponse)
def tracking_error(
    portfolioId: str = Query(), 
    benchmarkId: str = Query(), 
    startDate: str = Query(), 
    endDate: str = Query()
):
    te = None

    if te is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolioId, "bmk_id": benchmarkId, "tracking_error": te}

@app.get("/health")
def health(request: Request):
    return JSONResponse(content={ "status": "ok" }, status_code=200)

@app.get("/cache/status")
def cache_status():
    # show a tiny peek so you know it’s real
    sample = None
    if PORTFOLIO_PRICE_CACHE:
        # pick the first portfolio with data
        sample = PORTFOLIO_PRICE_CACHE[3]

    return {"stats": CACHE_BUILD_STATS, "sample": sample}
