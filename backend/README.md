# Tailor — Backend

FastAPI backend for the Tailor resume customizer. Handles resume parsing, LLM tailoring via Groq, auth, and history storage.

## Stack

- **FastAPI** — HTTP API
- **Groq** (`llama-3.3-70b-versatile`) — LLM via OpenAI-compatible SDK
- **pdfplumber** — PDF parsing
- **python-docx** — DOCX parsing and generation
- **SQLAlchemy + SQLite** — history storage
- **PyJWT + bcrypt** — authentication

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set your GROQ_API_KEY
```

## Running

```bash
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Health check: `GET /api/health`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | Model name (default: `llama-3.3-70b-versatile`) |
| `JWT_SECRET_KEY` | No | JWT signing secret (use a strong random string in production) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (default: `http://localhost:3000`) |
| `DATABASE_URL` | No | SQLAlchemy DB URL (default: `sqlite:///./tailor.db`) |

## API Reference

### Core

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/customize` | Upload resume (PDF/DOCX) + job description, returns tailored result |
| `POST` | `/api/download` | Generate DOCX from tailored resume data |
| `POST` | `/api/cover-letter` | Generate a tailored cover letter |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register with email + password |
| `POST` | `/api/auth/login` | Login, returns JWT access token |
| `GET` | `/api/auth/me` | Get current user (requires `Authorization: Bearer <token>`) |

### History

All history endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/history` | Save a tailored result |
| `GET` | `/api/history` | List all history items for current user |
| `GET` | `/api/history/{id}` | Get full history item including original text and tailored JSON |
| `PATCH` | `/api/history/{id}/cover-letter` | Save a cover letter to a history item |
| `DELETE` | `/api/history/{id}` | Delete a history item |

## File Overview

| File | Purpose |
|---|---|
| `main.py` | FastAPI app, route definitions |
| `llm_service.py` | Groq LLM calls — tailoring + cover letter |
| `resume_parser.py` | PDF (pdfplumber) and DOCX (python-docx) text extraction |
| `auth.py` | Password hashing (bcrypt), JWT creation and verification |
| `database.py` | SQLAlchemy engine and session setup |
| `models.py` | `User` and `ResumeHistory` ORM models |

## Production

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `ALLOWED_ORIGINS` to your frontend domain (e.g. `https://your-app.vercel.app`).
