import { CustomizeResponse, AuthResponse, HistoryListItem, HistoryItem, CustomizedResume } from './types';

const PROD_API = 'https://resume-customizer-web-app.onrender.com';
const BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : PROD_API;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export async function customizeResume(
  jobDescription: string,
  resumeFile: File
): Promise<CustomizeResponse> {
  const form = new FormData();
  form.append('job_description', jobDescription);
  form.append('resume', resumeFile);
  const res = await fetch(`${BASE}/api/customize`, { method: 'POST', body: form });
  return handleResponse<CustomizeResponse>(res);
}

export async function downloadResumeDocx(
  data: CustomizedResume & { candidate_name?: string }
): Promise<void> {
  const res = await fetch(`${BASE}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customized_resume.docx';
  a.click();
  URL.revokeObjectURL(url);
}

export async function generateCoverLetter(
  jobDescription: string,
  resumeText: string
): Promise<string> {
  const res = await fetch(`${BASE}/api/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_description: jobDescription, resume_text: resumeText }),
  });
  const data = await handleResponse<{ cover_letter: string }>(res);
  return data.cover_letter;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function getMe(token: string): Promise<{ id: number; email: string }> {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ id: number; email: string }>(res);
}

export async function saveHistory(
  token: string,
  payload: {
    jd_snippet: string;
    filename: string;
    original_text: string;
    customized_json: object;
  }
): Promise<{ id: number; created_at: string }> {
  const res = await fetch(`${BASE}/api/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ id: number; created_at: string }>(res);
}

export async function listHistory(token: string): Promise<HistoryListItem[]> {
  const res = await fetch(`${BASE}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<HistoryListItem[]>(res);
}

export async function getHistoryItem(token: string, id: number): Promise<HistoryItem> {
  const res = await fetch(`${BASE}/api/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<HistoryItem>(res);
}

export async function deleteHistoryItem(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<{ ok: boolean }>(res);
}

export async function updateHistoryCoverLetter(
  token: string,
  id: number,
  coverLetter: string
): Promise<void> {
  const res = await fetch(`${BASE}/api/history/${id}/cover-letter`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cover_letter: coverLetter }),
  });
  await handleResponse<{ ok: boolean }>(res);
}
