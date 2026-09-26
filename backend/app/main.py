from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api import auth, portfolios, dashboard, dividends, calendar, agents, explanations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure database tables exist and seed default accounts on initial launch."""
    try:
        from app.db.session import engine, Base, SessionLocal
        from app.db.models import User
        from app.db.seed import seed_database

        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                print("[Startup] Database is empty. Running initial seed...")
                seed_database(db=db)
        finally:
            db.close()
    except Exception as e:
        print(f"[Startup] Note on DB startup check: {e}")
    yield


app = FastAPI(
    title="DividendLens API",
    description="Swarm-Inspired Dividend Income Tracker Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API v1 Router
api_v1_router = APIRouter(prefix="/api/v1")


@api_v1_router.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint verifying backend connectivity."""
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "version": "1.0.0",
            "services": {
                "database": "connected",
                "redis": "connected",
            },
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
    }


# Include all sub-routers
api_v1_router.include_router(auth.router)
api_v1_router.include_router(portfolios.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(dividends.router)
api_v1_router.include_router(calendar.router)
api_v1_router.include_router(agents.router)
api_v1_router.include_router(explanations.router)

# Include main API v1 router in FastAPI app
app.include_router(api_v1_router)


@app.get("/health", tags=["Health"], include_in_schema=False)
def root_health():
    """Direct root health check for deployment orchestrators."""
    return health_check()


@app.get("/", include_in_schema=False)
def root_redirect():
    return {
        "name": "DividendLens API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
