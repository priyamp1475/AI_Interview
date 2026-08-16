import pdfplumber
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
import auth
import models
import ai_service

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()

    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in this PDF")

    try:
        analysis = ai_service.extract_skills_from_resume(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

    resume = models.Resume(
        user_id=current_user.id,
        filename=file.filename,
        extracted_text=text,
        skills=", ".join(analysis.get("skills", [])),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "resume_id": resume.id,
        "filename": resume.filename,
        "skills": analysis.get("skills", []),
        "experience_summary": analysis.get("experience_summary", ""),
        "suggested_roles": analysis.get("suggested_roles", []),
    }


@router.get("/mine")
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
    return [
        {"id": r.id, "filename": r.filename, "skills": r.skills, "uploaded_at": r.uploaded_at}
        for r in resumes
    ]
