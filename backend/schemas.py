from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class SessionCreate(BaseModel):
    role: str
    topic: str


class QuestionOut(BaseModel):
    id: int
    question_text: str
    order_index: int

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    role: str
    topic: str
    questions: list[QuestionOut]

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str


class AnswerResult(BaseModel):
    score: float
    feedback: str