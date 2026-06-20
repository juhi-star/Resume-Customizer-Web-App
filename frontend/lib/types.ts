export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface CustomizedResume {
  summary: string;
  relevant_skills: string[];
  experience: ExperienceItem[];
  other_sections: string;
  missing_keywords: string[];
  match_score: number;
  ats_score: number;
}

export interface CustomizeResponse {
  original_resume_text: string;
  customized: CustomizedResume;
}

export interface ApiError {
  detail: string;
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface HistoryListItem {
  id: number;
  created_at: string;
  jd_snippet: string;
  filename: string;
}

export interface HistoryItem extends HistoryListItem {
  original_text: string;
  customized: CustomizedResume;
  cover_letter?: string;
}
