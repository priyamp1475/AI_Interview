from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import auth
import models

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .order_by(models.InterviewSession.started_at)
        .all()
    )

    session_summaries = []
    all_scores = []

    for session in sessions:
        answers = (
            db.query(models.Answer)
            .join(models.Question)
            .filter(models.Question.session_id == session.id)
            .filter(models.Answer.score.isnot(None))
            .all()
        )
        if not answers:
            continue

        scores = [a.score for a in answers]
        avg_score = sum(scores) / len(scores)
        all_scores.extend(scores)

        session_summaries.append({
            "session_id": session.id,
            "role": session.role,
            "topic": session.topic,
            "date": session.started_at,
            "questions_answered": len(scores),
            "average_score": round(avg_score, 1),
        })

    overall_average = round(sum(all_scores) / len(all_scores), 1) if all_scores else None

    coding_count = (
        db.query(models.CodingSubmission)
        .join(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .count()
    )
    sql_count = (
        db.query(models.QuizResult)
        .join(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .count()
    )
    resume_count = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == current_user.id)
        .count()
    )

    return {
        "total_interview_sessions": len(session_summaries),
        "total_questions_answered": len(all_scores),
        "overall_average_score": overall_average,
        "sessions": session_summaries,
        "coding_submissions_count": coding_count,
        "sql_attempts_count": sql_count,
        "resumes_uploaded": resume_count,
    }
