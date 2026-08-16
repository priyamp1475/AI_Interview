import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import auth
import models
import ai_service

router = APIRouter(prefix="/sql", tags=["SQL Quiz"])


class QuestionRequest(BaseModel):
    topic: str
    difficulty: str = "easy"


class RunRequest(BaseModel):
    schema_sql: str
    seed_sql: str
    solution_query: str
    user_query: str


def run_query_on_fresh_db(schema_sql: str, seed_sql: str, query: str):
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    try:
        cursor.executescript(schema_sql)
        cursor.executescript(seed_sql)
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        return {"columns": columns, "rows": rows, "error": None}
    except Exception as e:
        return {"columns": [], "rows": [], "error": str(e)}
    finally:
        conn.close()


@router.post("/generate")
def generate_question(
    payload: QuestionRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        question = ai_service.generate_sql_question(payload.topic, payload.difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

    return question


@router.post("/run")
def run_sql(
    payload: RunRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    expected = run_query_on_fresh_db(payload.schema_sql, payload.seed_sql, payload.solution_query)
    actual = run_query_on_fresh_db(payload.schema_sql, payload.seed_sql, payload.user_query)

    if actual["error"]:
        return {
            "correct": False,
            "error": actual["error"],
            "expected_columns": expected["columns"],
            "expected_rows": expected["rows"],
            "actual_columns": [],
            "actual_rows": [],
        }

    is_correct = (
        sorted(expected["rows"]) == sorted(actual["rows"])
        and expected["columns"] == actual["columns"] or sorted(expected["rows"]) == sorted(actual["rows"])
    )

    return {
        "correct": is_correct,
        "error": None,
        "expected_columns": expected["columns"],
        "expected_rows": expected["rows"],
        "actual_columns": actual["columns"],
        "actual_rows": actual["rows"],
    }
