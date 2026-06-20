'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const MIN_JD_LENGTH = 50;

export default function JobDescriptionInput({ value, onChange, disabled }: Props) {
  const tooShort = value.trim().length > 0 && value.trim().length < MIN_JD_LENGTH;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Job Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
        placeholder="Paste the full job description here..."
        className={`w-full rounded-lg border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
          tooShort ? 'border-red-400' : 'border-gray-300'
        } ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}
      />
      {tooShort && (
        <p className="text-xs text-red-500">
          Please enter at least {MIN_JD_LENGTH} characters ({MIN_JD_LENGTH - value.trim().length} more needed)
        </p>
      )}
      <p className="text-xs text-gray-400">{value.trim().length} characters</p>
    </div>
  );
}
