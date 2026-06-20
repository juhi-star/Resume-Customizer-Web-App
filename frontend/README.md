# Tailor — Frontend

Next.js 14 frontend for the Tailor resume customizer.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**

## Setup

```bash
npm install

cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL (e.g. `http://localhost:8000` or your Render/Railway URL) |

## File Overview

```
app/
  layout.tsx          # Root layout, wraps with AuthProvider
  page.tsx            # Main page — form, result display, history panel

components/
  JobDescriptionInput.tsx   # JD textarea with character validation
  ResumeUpload.tsx          # Drag-and-drop + browse file upload
  ResumeOutput.tsx          # Tailored result display — scores, sections, cover letter, download
  MatchScoreBadge.tsx       # Score badge (green/yellow/red)
  AuthModal.tsx             # Login / register modal
  HistoryPanel.tsx          # List and load past results

contexts/
  AuthContext.tsx     # Auth state — user, token, login, logout

lib/
  api.ts              # All fetch calls to the backend
  types.ts            # TypeScript interfaces
```

## Key Flows

**Tailor a resume**
1. Paste job description (min 50 chars)
2. Upload PDF or DOCX (max 5MB)
3. Click "Tailor My Resume"
4. View tailored summary, skills, experience, missing keywords, match/ATS scores
5. Switch to "Original" tab to compare
6. Download as DOCX or generate a cover letter

**Auth + History**
- Sign in / register via the header button
- Results are automatically saved to history when logged in
- Generated cover letters are saved to the history record
- Open History panel to load any past result
