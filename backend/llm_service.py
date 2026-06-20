"""
llm_service.py
Handles prompt engineering and calls to the Groq LLM API (via OpenAI SDK) to customize
a resume against a job description.
"""
import json
import os
import re

from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")

SYSTEM_PROMPT = """You are an expert resume writer and career coach with deep experience in
technical recruiting and Applicant Tracking Systems (ATS). Your job is to tailor a candidate's
resume to a specific job description WITHOUT inventing facts, employers, dates, or experience
the candidate does not have. You may rephrase, reorder, emphasize, and surface relevant existing
content, but you must never fabricate skills, jobs, or accomplishments.

You will be given:
1. JOB_DESCRIPTION - the target job posting
2. RESUME_TEXT - the raw extracted text of the candidate's current resume

Your tasks:
1. Rewrite the professional summary/objective so it aligns with the JD's role, seniority, and
   priorities, using only truthful information drawn from the resume.
2. From the candidate's existing skills, identify and surface the ones that are most relevant to
   the JD. Do not invent skills the candidate doesn't list or imply.
3. Reorder and rephrase experience bullets (using the candidate's real experience) so the most
   JD-relevant achievements and keywords appear first and are phrased using JD terminology where
   truthful and appropriate.
4. Identify missing keywords/skills mentioned in the JD that the candidate's resume does not
   currently reflect, as suggestions for the candidate to consider (NOT to be added to the
   resume body itself).
5. Estimate a match score (0-100) reflecting how well the ORIGINAL resume aligns with the JD.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this schema:
{
  "match_score": <integer 0-100, how well the ORIGINAL resume aligns with the JD>,
  "ats_score": <integer 0-100, estimate of how ATS-friendly the CUSTOMIZED resume is based on keyword density, formatting clarity, and standard section names>,
  "summary": "<rewritten professional summary, 3-5 sentences>",
  "relevant_skills": ["skill1", "skill2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "experience": [
    {
      "title": "<job title as in resume>",
      "company": "<company as in resume>",
      "duration": "<duration as in resume, if present>",
      "bullets": ["<rephrased bullet 1>", "<rephrased bullet 2>", ...]
    }
  ],
  "other_sections": "<any other resume content (education, certifications, projects) lightly
     reformatted as plain text, preserved truthfully>"
}

Rules:
- Never fabricate employers, titles, dates, degrees, or skills not present or reasonably implied
  in RESUME_TEXT.
- Keep all factual content (employers, dates, degrees) unchanged from the original resume.
- Output must be valid JSON and nothing else.
"""


class LLMServiceError(Exception):
    """Raised when the LLM call fails or returns an unusable response."""


def _get_client() -> OpenAI:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise LLMServiceError(
            "GROQ_API_KEY is not configured on the server. Set it in your .env file."
        )
    return OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)


def _extract_json(raw_text: str) -> dict:
    """Strip markdown fences the LLM may add despite instructions."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        # Try to salvage the largest {...} block
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise LLMServiceError(
            f"Could not parse LLM response as JSON: {exc}"
        ) from exc


def customize_resume(job_description: str, resume_text: str) -> dict:
    """Call Groq to produce a tailored resume as structured JSON."""
    try:
        client = _get_client()
        user_prompt = (
            f"JOB_DESCRIPTION:\n{job_description}\n\n"
            f"RESUME_TEXT:\n{resume_text}\n\n"
            "Return the JSON now."
        )
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )

        raw_text = response.choices[0].message.content
        if not raw_text:
            raise LLMServiceError("LLM returned an empty response (possibly blocked).")
        data = _extract_json(raw_text)

        # Basic shape validation with sane fallbacks
        data.setdefault("match_score", 0)
        data.setdefault("ats_score", 0)
        data.setdefault("summary", "")
        data.setdefault("relevant_skills", [])
        data.setdefault("missing_keywords", [])
        data.setdefault("experience", [])
        data.setdefault("other_sections", "")
        return data

    except LLMServiceError:
        raise
    except Exception as exc:
        raise LLMServiceError(f"LLM API call failed: {exc}") from exc


COVER_LETTER_PROMPT = """You are an expert career coach and professional writer.
Write a compelling, concise cover letter based on the job description and resume provided.

Rules:
- Professional yet personable tone
- 3-4 paragraphs: opening hook, relevant experience, why this role/company, call to action
- Never fabricate facts not present in the resume
- Under 350 words
- Do NOT include date, address headers, or "Dear Hiring Manager" — return only the body paragraphs
- Return plain text only, no markdown
"""


def generate_cover_letter(job_description: str, resume_text: str) -> str:
    try:
        client = _get_client()
        user_prompt = (
            f"JOB_DESCRIPTION:\n{job_description}\n\n"
            f"RESUME_TEXT:\n{resume_text}\n\n"
            "Write the cover letter body now."
        )
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": COVER_LETTER_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=1024,
        )
        text = response.choices[0].message.content
        if not text:
            raise LLMServiceError("LLM returned an empty cover letter.")
        return text.strip()
    except LLMServiceError:
        raise
    except Exception as exc:
        raise LLMServiceError(f"Cover letter generation failed: {exc}") from exc
