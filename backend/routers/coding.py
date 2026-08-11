import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import auth
import models
import ai_service

router = APIRouter(prefix="/coding", tags=["Coding Round"])

PISTON_URL = "https://emkc.org/api/v2/piston/execute"


class ProblemRequest(BaseModel):
    topic: str
    difficulty: str = "easy"


class TestCase(BaseModel):
    input: str
    expected_output: str


class RunRequest(BaseModel):
    code: str
    language: str = "python"
    test_cases: list[TestCase]


@router.post("/generate")
def generate_problem(
    payload: ProblemRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        problem = ai_service.generate_coding_problem(payload.topic, payload.difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Problem generation failed: {str(e)}")

    return problem


@router.post("/run")
def run_code(
    payload: RunRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    results = []

    with httpx.Client(timeout=15.0) as client:
        for tc in payload.test_cases:
            try:
                response = client.post(
                    PISTON_URL,
                    json={
                        "language": payload.language,
                        "version": "3.10.0",
                        "files": [{"content": payload.code}],
                        "stdin": tc.input,
                    },
                )
                data = response.json()
                actual_output = data.get("run", {}).get("stdout", "").strip()
                stderr = data.get("run", {}).get("stderr", "")
            except Exception as e:
                actual_output = ""
                stderr = str(e)

            passed = actual_output == tc.expected_output.strip()

            results.append({
                "input": tc.input,
                "expected_output": tc.expected_output,
                "actual_output": actual_output,
                "passed": passed,
                "error": stderr if stderr else None,
            })

    all_passed = all(r["passed"] for r in results)

    return {"all_passed": all_passed, "results": results}
