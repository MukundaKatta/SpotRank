import os
import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import init_db
from .routers import auth, business, content, prompts
from .routers.business import analytics_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("spotrank")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="SpotRank API",
    description="API for local SEO optimization and Google Business Profile management",
    version="2.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 1)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response


# Include routers
app.include_router(auth.router)
app.include_router(business.router)
app.include_router(content.router)
app.include_router(prompts.router)
app.include_router(analytics_router)


@app.on_event("startup")
def startup_event():
    """Initialize database and validate environment on startup"""
    # Validate required env vars
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY is not set — AI features will not work")
    else:
        logger.info("ANTHROPIC_API_KEY configured")

    db_url = os.getenv("DATABASE_URL", "sqlite:///./local_seo.db")
    logger.info(f"Database: {db_url.split('://')[0]}://***")
    logger.info(f"CORS origins: {origins}")

    init_db()
    logger.info("SpotRank API v2.0 started successfully")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "SpotRank API",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
