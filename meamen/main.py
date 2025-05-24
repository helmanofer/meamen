import logging
from fastapi import FastAPI
from meamen.api.auth import router as auth_router
from meamen.api.trainees import router as trainees_router
from meamen.api.trainers import router as trainers_router
from meamen.api.exercise import router as exercise_router
from meamen.api.training_session import router as training_session_router
from meamen.api.session_template import router as session_template_router
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware
from meamen.middleware.logging import RequestLoggingMiddleware
from contextlib import asynccontextmanager
from meamen.db.session import sync_engine, get_session
from meamen.db.seed_data import seed_default_exercises, seed_default_session_templates

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    SQLModel.metadata.create_all(sync_engine)
    
    # Seed default exercises and session templates
    for session in get_session():
        seed_default_exercises(session)
        seed_default_session_templates(session)
        break
    
    yield

app = FastAPI(title="Fitness Trainer API", version="1.0.0", lifespan=lifespan)

# Add request logging middleware (order matters - add before CORS)
app.add_middleware(RequestLoggingMiddleware)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(trainees_router)
app.include_router(trainers_router)
app.include_router(exercise_router)
app.include_router(training_session_router)
app.include_router(session_template_router)




@app.get("/")
def root():
    return {"message": "Welcome to the Fitness Trainer API"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "fitness-trainer-api"}
