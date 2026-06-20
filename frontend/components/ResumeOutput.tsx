'use client';

import { useState, useEffect } from 'react';
import { CustomizedResume } from '@/lib/types';
import { downloadResumeDocx, generateCoverLetter } from '@/lib/api';
import MatchScoreBadge from './MatchScoreBadge';

interface Props {
  resume: CustomizedResume;
  originalText: string;
  jobDescription: string;
  onCoverLetterGenerated?: (text: string) => void;
  initialCoverLetter?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function ResumeOutput({ resume, originalText, jobDescription, onCoverLetterGenerated, initialCoverLetter }: Props) {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter ?? '');

  useEffect(() => {
    setCoverLetter(initialCoverLetter ?? '');
  }, [initialCoverLetter]);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadResumeDocx(resume);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleCoverLetter() {
    setCoverLoading(true);
    setCoverError('');
    try {
      const text = await generateCoverLetter(jobDescription, originalText);
      setCoverLetter(text);
      onCoverLetterGenerated?.(text);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setCoverLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Tailored Resume</h2>
        <div className="flex gap-2 flex-wrap">
          <MatchScoreBadge score={resume.match_score ?? 0} label="Match" />
          <MatchScoreBadge score={resume.ats_score ?? 0} label="ATS" />
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {(['after', 'before'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'after' ? 'Tailored' : 'Original'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'before' ? (
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto">
          {originalText}
        </pre>
      ) : (
        <div className="space-y-5">
          {resume.summary && (
            <Section title="Summary">
              <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
            </Section>
          )}

          {resume.relevant_skills?.length > 0 && (
            <Section title="Key Skills">
              <div className="flex flex-wrap gap-2">
                {resume.relevant_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full border border-orange-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {resume.experience?.length > 0 && (
            <Section title="Experience">
              <div className="space-y-4">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-800">{exp.title}</p>
                      <p className="text-xs text-gray-400">{exp.duration}</p>
                    </div>
                    {exp.company && (
                      <p className="text-xs text-gray-500 mb-2">{exp.company}</p>
                    )}
                    <ul className="list-disc list-inside space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="text-sm text-gray-700">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.other_sections && (
            <Section title="Additional Information">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{resume.other_sections}</p>
            </Section>
          )}

          {resume.missing_keywords?.length > 0 && (
            <Section title="Missing Keywords">
              <div className="flex flex-wrap gap-2">
                {resume.missing_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full border border-amber-100"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition"
      >
        {downloading ? 'Preparing download...' : 'Download as DOCX'}
      </button>

      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Cover Letter</h3>
          <button
            onClick={handleCoverLetter}
            disabled={coverLoading}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
          >
            {coverLoading ? 'Generating...' : coverLetter ? 'Regenerate' : 'Generate'}
          </button>
        </div>

        {coverError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {coverError}
          </p>
        )}

        {coverLetter && !coverError && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
              {coverLetter}
            </pre>
          </div>
        )}

        {!coverLetter && !coverError && !coverLoading && (
          <p className="text-xs text-gray-400">
            Generate a tailored cover letter based on this job and your resume.
          </p>
        )}
      </div>
    </div>
  );
}
