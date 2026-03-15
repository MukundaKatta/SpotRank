from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from .database import init_db
from .routers import business, content, prompts

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Local SEO Optimizer API",
    description="API for local SEO optimization and Google Business Profile management",
    version="1.0.0"
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(business.router)
app.include_router(content.router)
app.include_router(prompts.router)


@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Local SEO Optimizer API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
