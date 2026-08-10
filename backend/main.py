from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import auth as auth_router
from routers import interview as interview_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Interview Prep Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(interview_router.router)


@app.get("/")
def read_root():
    return {"message": "AI Interview Prep Platform API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}