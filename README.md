# Tailor — AI Resume Customizer

Tailor takes a job description and your resume, then uses an LLM to rewrite your resume so it's tailored to that specific role. It highlights relevant skills, rewrites experience bullets, flags missing keywords, and generates a cover letter — all in one step.

## Features

- **Resume tailoring** — paste a job description, upload your resume (PDF or DOCX), and get a customized version instantly
- **Match Score** — percentage showing how well your tailored resume matches the job
- **ATS Score** — how ATS-friendly the output is
- **Missing Keywords** — terms from the JD that are absent from your resume
- **Before / After view** — compare your original resume with the tailored version
- **Cover Letter Generator** — one-click tailored cover letter based on the JD and your resume
- **DOCX Download** — download the tailored resume as a Word document
- **Auth + History** — sign up / sign in to save results and reload past sessions

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.9 |
| LLM | Groq (`llama-3.3-70b-versatile`) via OpenAI-compatible SDK |
| Auth | JWT (PyJWT) + bcrypt |
| Database | SQLite via SQLAlchemy |
| Resume parsing | pdfplumber (PDF), python-docx (DOCX) |

## Project Structure

```
Resume-Customizer-r/
├── backend/
│   ├── main.py            # FastAPI app, all routes
│   ├── llm_service.py     # Groq LLM calls
│   ├── resume_parser.py   # PDF + DOCX parsing
│   ├── auth.py            # JWT auth helpers
│   ├── database.py        # SQLAlchemy + SQLite setup
│   ├── models.py          # User + ResumeHistory ORM models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── page.tsx        # Main page
    │   └── layout.tsx
    ├── components/
    │   ├── ResumeOutput.tsx
    │   ├── JobDescriptionInput.tsx
    │   ├── ResumeUpload.tsx
    │   ├── AuthModal.tsx
    │   ├── HistoryPanel.tsx
    │   └── MatchScoreBadge.tsx
    ├── contexts/
    │   └── AuthContext.tsx
    ├── lib/
    │   ├── api.ts
    │   └── types.ts
    └── .env.example
```

## Local Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set GROQ_API_KEY
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | Model to use (default: `llama-3.3-70b-versatile`) |
| `JWT_SECRET_KEY` | Secret for signing JWTs — use a long random string in production |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (e.g. `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL (e.g. `http://localhost:8000`) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/customize` | Upload resume + JD, returns tailored result |
| `POST` | `/api/download` | Generate and download DOCX |
| `POST` | `/api/cover-letter` | Generate a cover letter |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user (requires Bearer token) |
| `POST` | `/api/history` | Save a result to history |
| `GET` | `/api/history` | List history items |
| `GET` | `/api/history/{id}` | Get a specific history item |
| `PATCH` | `/api/history/{id}/cover-letter` | Save cover letter to a history item |
| `DELETE` | `/api/history/{id}` | Delete a history item |

## Deployment

**Frontend → Vercel**

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

**Backend → Render or Railway**

Set environment variables in the platform dashboard:
```
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile
JWT_SECRET_KEY=your_random_secret
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Start command:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```
