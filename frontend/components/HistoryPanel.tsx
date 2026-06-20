'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryListItem, HistoryItem } from '@/lib/types';
import * as api from '@/lib/api';

interface Props {
  onLoad: (item: HistoryItem) => void;
}

export default function HistoryPanel({ onLoad }: Props) {
  const { token } = useAuth();
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    api.listHistory(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleLoad(id: number) {
    if (!token) return;
    setLoadingId(id);
    try {
      const item = await api.getHistoryItem(token, id);
      onLoad(item);
    } catch {
      alert('Failed to load history item.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm('Delete this history item?')) return;
    try {
      await api.deleteHistoryItem(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400 py-4 text-center">Loading history...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No history yet.</p>
        <p className="text-xs mt-1">Submit a resume to save your first result.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700 truncate">{item.filename}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.jd_snippet}</p>
              <p className="text-xs text-gray-300 mt-1">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => handleLoad(item.id)}
                disabled={loadingId === item.id}
                className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-1 rounded disabled:opacity-50 transition"
              >
                {loadingId === item.id ? '...' : 'Load'}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-gray-400 hover:text-red-500 px-1 py-1 rounded transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
