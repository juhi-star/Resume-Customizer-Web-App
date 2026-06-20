'use client';

interface Props {
  score: number;
  label?: string;
}

function getColor(score: number) {
  if (score >= 75) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export default function MatchScoreBadge({ score, label = 'Match' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getColor(score)}`}>
      <span className="font-bold">{score}%</span>
      <span>{label}</span>
    </span>
  );
}
