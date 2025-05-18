from fastapi import FastAPI
from meamen.api.auth import router as auth_router
from meamen.api.trainees import router as trainees_router
from meamen.api.trainers import router as trainers_router
from meamen.api.exercise import router as exercise_router
from meamen.api.training_session import router as training_session_router
from sqlmodel import SQLModel
from meamen.db.session import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(auth_router)
app.include_router(trainees_router)
app.include_router(trainers_router)
app.include_router(exercise_router)
app.include_router(training_session_router)

# enable cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


@app.get("/")
def root():
    return {"message": "Welcome to the Fitness Trainer API"}
