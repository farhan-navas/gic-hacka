from contextlib import asynccontextmanager
import logging, time, os, tempfile, json

from fastapi import FastAPI, HTTPException, Request, Query
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date as Date, datetime, timedelta

from services.compute import (
    compute_daily_return, compute_cumulative_return,
    compute_volatility, compute_correlation, compute_tracking_error
)

from models import (
    PortfolioPriceResponse, DailyReturnResponse, CorrelationResponse, CumulativeReturnResponse, 
    DailyVolatilityResponse, TrackingErrorResponse
)

from db.config import DB_CONFIG

log = logging.getLogger("portfolio-cache")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

CACHE_JSON_PATH = os.getenv("CACHE_JSON_PATH", "/app/portfolio_cache.json")
FORCE_REBUILD_CACHE = os.getenv("FORCE_REBUILD_CACHE", "0") == "1"

# This will be populated at startup and remain static until restart
PORTFOLIO_PRICE_CACHE: dict[int, dict] = {}
CACHE_BUILD_STATS = {"portfolios": 0, "dates": 0, "seconds": 0.0}
DATE_FORMAT_STRING = "%Y-%m-%d"

def _serialize_cache_to_jsonable(cache: dict[int, dict[Date, float]]) -> dict:
    """
    Convert {pid: {date: price}} with Date keys -> {str(pid): {iso_date: price}} for JSON.
    """
    out: dict[str, dict[str, float]] = {}
    for pid, by_date in cache.items():
        out[str(pid)] = {d.isoformat(): float(v) for d, v in by_date.items()}
    return out

def _deserialize_cache_from_jsonable(obj: dict) -> dict[int, dict[Date, float]]:
    """
    Convert {str(pid): {iso_date: price}} -> {pid: {date: price}} with Date keys.
    """
    out: dict[int, dict[Date, float]] = {}
    for pid_str, by_date in obj.items():
        pid = int(pid_str)
        out[pid] = {}
        for d_str, v in by_date.items():
            out[pid][datetime.fromisoformat(d_str).date()] = float(v)
    return out

def _write_json_atomic(path: str, data: dict) -> None:
    """Write JSON atomically: write to tmp, then os.replace()."""
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".cache_", dir=os.path.dirname(path) or ".")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(tmp_path, path)
    finally:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass

def _load_cache_from_file(path: str) -> dict[int, dict[Date, float]]:
    with open(path, "r") as f:
        obj = json.load(f)
    return _deserialize_cache_from_jsonable(obj)

def _load_all_prices():
    """Connects to Postgres, computes portfolio prices, returns nested dict."""
    # ---- replace with your real credentials / config
    # Add per-session options (increase statement_timeout; optional work_mem tweak)
    db_kwargs = dict(DB_CONFIG)
    extra_opts = "-c statement_timeout=600000 -c lock_timeout=0 -c idle_in_transaction_session_timeout=0"
    if "options" in db_kwargs and db_kwargs["options"]:
        db_kwargs["options"] = f"{db_kwargs['options']} {extra_opts}"
    else:
        db_kwargs["options"] = extra_opts

    conn = psycopg2.connect(**db_kwargs)
    try:
        # --- Load portfolio hierarchy (small result set) ---
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
    try:
        if os.path.exists(CACHE_JSON_PATH) and not FORCE_REBUILD_CACHE:
            log.info(f"📦 Loading portfolio cache from {CACHE_JSON_PATH} …")
            cache = _load_cache_from_file(CACHE_JSON_PATH)
            PORTFOLIO_PRICE_CACHE.clear()
            PORTFOLIO_PRICE_CACHE.update(cache)
            # stats
            all_dates = set()
            for d in PORTFOLIO_PRICE_CACHE.values():
                all_dates.update(d.keys())
            dt = time.perf_counter() - t0
            CACHE_BUILD_STATS.update({
                "portfolios": len(PORTFOLIO_PRICE_CACHE),
                "dates": len(all_dates),
                "seconds": round(dt, 3),
                "source": "file",
            })
            log.info(f"✅ Cache loaded from file: {CACHE_BUILD_STATS['portfolios']} portfolios,"
                     f" {CACHE_BUILD_STATS['dates']} dates in {CACHE_BUILD_STATS['seconds']}s")
        else:
            if FORCE_REBUILD_CACHE:
                log.info("♻️  FORCE_REBUILD_CACHE=1 — ignoring existing cache file")
            log.info("🔄 Building portfolio price cache from DB …")
            cache = _load_all_prices()
            PORTFOLIO_PRICE_CACHE.clear()
            PORTFOLIO_PRICE_CACHE.update(cache)
            # persist to JSON (dates -> ISO strings)
            json_obj = _serialize_cache_to_jsonable(PORTFOLIO_PRICE_CACHE)
            _write_json_atomic(CACHE_JSON_PATH, json_obj)
            # stats
            all_dates = set()
            for d in PORTFOLIO_PRICE_CACHE.values():
                all_dates.update(d.keys())
            dt = time.perf_counter() - t0
            CACHE_BUILD_STATS.update({
                "portfolios": len(PORTFOLIO_PRICE_CACHE),
                "dates": len(all_dates),
                "seconds": round(dt, 3),
                "source": "db",
            })
            log.info(f"✅ Cache built & saved: {CACHE_BUILD_STATS['portfolios']} portfolios,"
                     f" {CACHE_BUILD_STATS['dates']} dates in {CACHE_BUILD_STATS['seconds']}s"
                     f" → {CACHE_JSON_PATH}")
    except Exception as e:
        log.exception("❌ Cache init failed: %s", e)
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
    date_yesterday = str(datetime.strptime(date, DATE_FORMAT_STRING) - timedelta(days=1))

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
    dates, cumulative = None, None
    if cumulative is None:
        raise HTTPException(status_code=404, detail="No data found")
    return {"portfolioId": portfolioId, "cumulativeReturn": cumulative}

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
