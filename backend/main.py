from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine
from routes.ai import router as ai_router
from routes.auth import router as auth_router
from routes.projects import router as projects_router
from routes.tasks import router as tasks_router
from routes.users import router as users_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(ai_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health/db")
def db_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"database": "connected", "name": "taskflow-ai"}


