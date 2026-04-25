"""
FastAPI application entry point
Initializes the FastAPI app and includes all routers
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import APP_NAME, APP_VERSION, API_V1_STR

# Import all routers
from app.modules.employees.router import router as employees_router
from app.modules.events.router import router as events_router
from app.modules.surveys.router import router as surveys_router
from app.modules.queries.router import router as queries_router
from app.modules.knowledge_base.router import router as knowledge_base_router
from app.modules.notifications.router import router as notifications_router
from app.modules.audit_logs.router import router as audit_logs_router

# Create FastAPI app instance
app = FastAPI(
    title=APP_NAME,
    description="A modular Employee Engagement Platform built with FastAPI and SQLAlchemy",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS middleware
# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["system"])
async def health_check():
    """
    Health check endpoint to verify the API is running
    
    Returns:
    - status: "healthy" if API is up and running
    """
    return {"status": "healthy"}


# Include all routers with API v1 prefix
app.include_router(
    employees_router,
    prefix=f"{API_V1_STR}/employees",
)

app.include_router(
    events_router,
    prefix=f"{API_V1_STR}/events",
)

app.include_router(
    surveys_router,
    prefix=f"{API_V1_STR}/surveys",
)

app.include_router(
    queries_router,
    prefix=f"{API_V1_STR}/queries",
)

app.include_router(
    knowledge_base_router,
    prefix=f"{API_V1_STR}/knowledge-base",
)

app.include_router(
    notifications_router,
    prefix=f"{API_V1_STR}/notifications",
)

app.include_router(
    audit_logs_router,
    prefix=f"{API_V1_STR}/audit-logs",
)


# Root endpoint
@app.get("/", tags=["system"])
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the app with uvicorn
    # Command: python app/main.py
    # Or: uvicorn app.main:app --reload
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
