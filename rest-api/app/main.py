from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, HTTPException, Request, Query
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date

from services.compute import (
    compute_daily_return, compute_cumulative_return,
    compute_volatility, compute_correlation, compute_tracking_error
)

from models import (
    PortfolioPriceResponse, DailyReturnResponse, CorrelationResponse, CumulativeReturnResponse, 
    DailyVolatilityResponse, TrackingErrorResponse
)

from db.config import DB_CONFIG
import time, os

log = logging.getLogger("portfolio-cache")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# This will be populated at startup and remain static until restart
PORTFOLIO_PRICE_CACHE: dict[int, dict] = {}
CACHE_BUILD_STATS = {"portfolios": 0, "dates": 0, "seconds": 0.0}

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
    start = time.time()
    price = PORTFOLIO_PRICE_CACHE[int(portfolioId)][date]

    if price is None:
        raise HTTPException(status_code=404, detail="No data found")

    print("time taken = ", time.time() - start)
    return {"portfolioId": portfolioId, "date": date, "price": price}

@app.get("/daily-return", response_model=DailyReturnResponse)
def daily_return(
    portfolioId: str = Query(), 
    date: str = Query()
):
    dates, returns = None, None
    if returns is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolioId, "dates": dates, "daily_returns": returns}

@app.get("/cumulative-return", response_model=CumulativeReturnResponse)
def cumulative_return(
    portfolioId: str = Query(), 
    startDate: str = Query(),
    endDate: str = Query()
):  
    dates, cumulative = None, None
    if cumulative is None:
        raise HTTPException(status_code=404, detail="No data found")
    return {"portfolio_id": portfolioId, "dates": dates, "cumulative_returns": cumulative}

@app.get("/daily-volatility", response_model=DailyVolatilityResponse)
def volatility(
    portfolioId: str = Query(), 
    startDate: str = Query(), 
    endDate: str = Query()
):
    vol = None
    if vol is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolioId, "start_date": startDate, "end_date": endDate, "volatility": vol}

@app.get("/correlation", response_model=CorrelationResponse)
def correlation(
    portfolioId1: str = Query(),
    portfolioId2: str = Query(),
    startDate: str = Query(), 
    endDate: str = Query()
):
    corr = 0

    if corr is None:
        raise HTTPException(status_code=400, detail="Not enough data")
    return {"portfolio_id": portfolioId1, "bmk_id": portfolioId2, "correlation": corr}

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
    ok = hasattr(request.app.state, "pool")
    return {"status": "ok" if ok else "booting"}

@app.get("/cache/status")
def cache_status():
    # show a tiny peek so you know it’s real
    sample = None
    if PORTFOLIO_PRICE_CACHE:
        # pick the first portfolio with data
        sample = PORTFOLIO_PRICE_CACHE[3]

    return {"stats": CACHE_BUILD_STATS, "sample": sample}
