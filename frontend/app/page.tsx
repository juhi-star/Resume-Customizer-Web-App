'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomizeResponse, HistoryItem } from '@/lib/types';
import * as api from '@/lib/api';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResumeOutput from '@/components/ResumeOutput';
import AuthModal from '@/components/AuthModal';
import HistoryPanel from '@/components/HistoryPanel';

export default function Home() {
  const { user, token, logout, loading: authLoading } = useAuth();

  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<CustomizeResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please upload a resume file.');
      return;
    }
    setError('');
    setSubmitting(true);
    setResult(null);
    setHistoryId(null);
    setCoverLetter('');
    try {
      const data = await api.customizeResume(jobDescription, resumeFile);
      setResult(data);

      if (token) {
        try {
          const saved = await api.saveHistory(token, {
            jd_snippet: jobDescription.slice(0, 200),
            filename: resumeFile.name,
            original_text: data.original_resume_text,
            customized_json: data.customized,
          });
          setHistoryId(saved.id);
        } catch {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCoverLetterGenerated(text: string) {
    setCoverLetter(text);
    if (token && historyId) {
      api.updateHistoryCoverLetter(token, historyId, text).catch(() => {});
    }
  }

  function loadHistoryItem(item: HistoryItem) {
    setResult({
      original_resume_text: item.original_text,
      customized: item.customized,
    });
    setJobDescription(item.jd_snippet);
    setCoverLetter(item.cover_letter ?? '');
    setHistoryId(item.id);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-800 bg-black sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500">Tailor</h1>
            <p className="text-xs text-gray-500">AI-powered resume customizer</p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-gray-300 hover:text-orange-400 transition"
                >
                  History
                </button>
                <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-300 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showHistory && user && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Your History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            <HistoryPanel onLoad={loadHistoryItem} />
          </div>
        )}

        <div className={`grid gap-8 ${result ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 h-fit">
            {!user && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-xs text-orange-700">
                <strong>Tip:</strong> Sign in to save your results and access history.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={submitting}
              />
              <ResumeUpload
                file={resumeFile}
                onChange={setResumeFile}
                disabled={submitting}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !resumeFile || jobDescription.trim().length < 50}
                className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tailoring your resume...
                  </span>
                ) : (
                  'Tailor My Resume'
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <ResumeOutput
                resume={result.customized}
                originalText={result.original_resume_text}
                jobDescription={jobDescription}
                onCoverLetterGenerated={handleCoverLetterGenerated}
                initialCoverLetter={coverLetter}
              />
            </div>
          )}
        </div>
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
