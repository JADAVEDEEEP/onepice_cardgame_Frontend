import { withApiBase } from './apiBase';

export type SavedDeckRecord = {
  _id: string;
  deck_name: string;
  leader?: { card_code?: string; name?: string; color?: string };
  deck_cards: Array<{ card_code: string; count: number }>;
  deck_size: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'api';
};

export const listSavedDecksApi = async ({ page, limit, q }: { page: number; limit: number; q: string }) => {
  const params = new URLSearchParams({
    page: String(Math.max(1, page || 1)),
    limit: String(Math.max(1, limit || 12)),
  });
  if (String(q || '').trim()) params.set('q', String(q).trim());

  const response = await fetch(withApiBase(`/decks?${params.toString()}`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || `Failed to list saved decks (${response.status})`);
  }
  return { ...payload, source: 'api' as const };
};

export const getSavedDeckByIdApi = async (deckId: string) => {
  const response = await fetch(withApiBase(`/decks/${encodeURIComponent(deckId)}`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || `Failed to fetch deck (${response.status})`);
  }
  return { ...payload, source: 'api' as const };
};

export const saveDeckApi = async (payload: {
  deck_name: string;
  leader?: { card_code?: string; name?: string; color?: string };
  deck_cards: Array<{ card_code: string; count: number }>;
  tags?: string[];
  notes?: string;
}) => {
  const response = await fetch(withApiBase('/decks/save'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Failed to save deck (${response.status})`);
  }
  return { ...data, source: 'api' as const };
};
