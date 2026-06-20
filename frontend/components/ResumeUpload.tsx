'use client';

import { useRef } from 'react';

interface Props {
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
}

export default function ResumeUpload({ file, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
  }

  function validateAndSet(f: File) {
    const name = f.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    onChange(f);
  }

  const sizeLabel = file ? `${(file.size / 1024).toFixed(1)} KB` : '';

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Resume</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        {file ? (
          <div className="space-y-1">
            <p className="font-medium text-gray-800 text-sm">{file.name}</p>
            <p className="text-xs text-gray-400">{sizeLabel}</p>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 text-3xl">📄</div>
            <p className="text-sm text-gray-500">
              Drag & drop or <span className="text-orange-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400">PDF or DOCX, max 5MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
