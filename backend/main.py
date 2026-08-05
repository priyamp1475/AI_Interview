from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine

# This creates all tables defined in models.py, if they don't already exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Interview Prep Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Interview Prep Platform API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}