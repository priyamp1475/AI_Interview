from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
import ai_service

router = APIRouter(prefix="/interview", tags=["AI Interviewer"])


@router.post("/start", response_model=schemas.SessionOut)
def start_session(
    payload: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Create the session record
    session = models.InterviewSession(
        user_id=current_user.id,
        role=payload.role,
        topic=payload.topic,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Ask the AI for questions
    try:
        question_texts = ai_service.generate_questions(payload.role, payload.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI question generation failed: {str(e)}")

    # Save each question
    for i, text in enumerate(question_texts):
        question = models.Question(
            session_id=session.id,
            question_text=text,
            order_index=i,
        )
        db.add(question)
    db.commit()
    db.refresh(session)

    return session


@router.post("/answer", response_model=schemas.AnswerResult)
def submit_answer(
    payload: schemas.AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    question = db.query(models.Question).filter(models.Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        result = ai_service.evaluate_answer(question.question_text, payload.answer_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")

    answer = models.Answer(
        question_id=question.id,
        answer_text=payload.answer_text,
        score=result["score"],
        feedback=result["feedback"],
    )
    db.add(answer)
    db.commit()

    return result