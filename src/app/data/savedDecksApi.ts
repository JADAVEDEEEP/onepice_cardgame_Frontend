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
  source?: 'local' | 'api';
};

const LOCAL_SAVED_DECKS_KEY = 'optcg_saved_decks_local';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const getLocalSavedDecks = (): SavedDeckRecord[] => {
  if (typeof window === 'undefined') return [];
  const rows = safeParse<SavedDeckRecord[]>(window.localStorage.getItem(LOCAL_SAVED_DECKS_KEY), []);
  return Array.isArray(rows) ? rows : [];
};

const setLocalSavedDecks = (rows: SavedDeckRecord[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_SAVED_DECKS_KEY, JSON.stringify(rows));
};

export const saveDeckLocal = (payload: {
  deck_name: string;
  leader?: { card_code?: string; name?: string; color?: string };
  deck_cards: Array<{ card_code: string; count: number }>;
  tags?: string[];
  notes?: string;
}) => {
  const now = new Date().toISOString();
  const row: SavedDeckRecord = {
    _id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    deck_name: payload.deck_name,
    leader: payload.leader || {},
    deck_cards: payload.deck_cards || [],
    deck_size: (payload.deck_cards || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0),
    tags: payload.tags || [],
    notes: payload.notes || '',
    createdAt: now,
    updatedAt: now,
    source: 'local',
  };
  const existing = getLocalSavedDecks();
  setLocalSavedDecks([row, ...existing]);
  return row;
};

export const listSavedDecksLocal = ({ page, limit, q }: { page: number; limit: number; q: string }) => {
  const normalizedQ = String(q || '').trim().toLowerCase();
  const filtered = getLocalSavedDecks().filter((row) => {
    if (!normalizedQ) return true;
    return (
      String(row.deck_name || '').toLowerCase().includes(normalizedQ) ||
      String(row.leader?.name || '').toLowerCase().includes(normalizedQ) ||
      String(row.leader?.card_code || '').toLowerCase().includes(normalizedQ)
    );
  });
  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.max(1, limit || 12);
  const skip = (safePage - 1) * safeLimit;
  const decks = filtered.slice(skip, skip + safeLimit);
  const totalPages = Math.max(1, Math.ceil(filtered.length / safeLimit));
  return {
    decks,
    count: decks.length,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: filtered.length,
      total_pages: totalPages,
      has_next: skip + safeLimit < filtered.length,
      has_prev: safePage > 1,
    },
    source: 'local' as const,
  };
};

export const saveDeckHybrid = async (payload: {
  deck_name: string;
  leader?: { card_code?: string; name?: string; color?: string };
  deck_cards: Array<{ card_code: string; count: number }>;
  tags?: string[];
  notes?: string;
}) => {
  try {
    const response = await fetch(withApiBase('/decks/save'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error(data?.message || 'Failed to save deck');
      }
      const local = saveDeckLocal(payload);
      return { mode: 'local' as const, deck: local };
    }
    return { mode: 'api' as const, data };
  } catch {
    const local = saveDeckLocal(payload);
    return { mode: 'local' as const, deck: local };
  }
};
