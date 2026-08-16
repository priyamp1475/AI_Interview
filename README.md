# AI Interview Prep Platform

A full-stack, AI-powered mock interview platform. Practice technical interviews with an AI interviewer that asks questions out loud, listens to your spoken answers, scores them, and gives feedback — plus a coding round, SQL quiz, resume analysis, and a performance dashboard to track progress over time.

**Live demo:** https://YOUR-VERCEL-URL.vercel.app
**Backend API docs:** https://ai-interview-ojio.onrender.com/docs

> Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 20-30 seconds to respond while the server wakes up — subsequent requests are fast.

---

## Features

- **AI Interviewer** — generates tailored interview questions for any role/topic using Google's Gemini API, and evaluates typed or spoken answers with a score and written feedback
- **Voice Questions** — questions are read aloud via the browser's Web Speech API, and answers can be given by voice (speech-to-text) or typed
- **Coding Round** — AI-generated coding problems with real code execution and test-case validation via the Piston API
- **SQL Quiz** — AI-generated SQL questions run against a sandboxed, disposable SQLite database per attempt, comparing your query's output to the correct solution
- **Resume Upload** — parses an uploaded PDF resume and extracts skills, an experience summary, and suggested roles using AI
- **Performance Analytics** — aggregates interview history into per-session and overall average scores
- **Authentication** — JWT-based auth with hashed passwords (bcrypt)

## Tech Stack

**Backend**
- Python, FastAPI
- SQLAlchemy ORM, PostgreSQL (production) / SQLite (local dev)
- JWT auth (python-jose, passlib/bcrypt)
- Google Gemini API for question generation, answer evaluation, and resume analysis
- Piston API for sandboxed code execution
- pdfplumber for PDF text extraction

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Web Speech API (SpeechSynthesis + SpeechRecognition) for voice questions/answers

**Deployment**
- Backend + PostgreSQL: Render (free tier)
- Frontend: Vercel (free tier)

## Architecture


frontend/ React app (Vite + Tailwind)
src/
api/ Axios client with JWT auto-attach
pages/ Login, Register, Dashboard, Interview, CodingRound, SqlQuiz, Resume, Analytics

backend/ FastAPI app
main.py App entrypoint, router registration
models.py SQLAlchemy models (User, InterviewSession, Question, Answer, etc.)
schemas.py Pydantic request/response schemas
auth.py JWT creation/validation, password hashing
ai_service.py All Gemini API calls (questions, evaluation, coding problems, SQL, resume analysis)
database.py DB engine setup (switches SQLite <-> PostgreSQL via DATABASE_URL)
routers/ One router per feature (auth, interview, coding, sql_quiz, resume, analytics)
## Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
# create a .env file with:
# GEMINI_API_KEY=your_key_here
python -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Backend runs at `http://127.0.0.1:8000` (docs at `/docs`), frontend at `http://localhost:5173`.

## Environment Variables

**Backend (`.env`):**
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (free tier) — https://aistudio.google.com/apikey |
| `DATABASE_URL` | Optional. PostgreSQL connection string for production; falls back to local SQLite if unset |

**Frontend (Vercel environment variable):**
| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of the deployed backend, e.g. `https://ai-interview-ojio.onrender.com` |

## Author

Priyam Panchal
