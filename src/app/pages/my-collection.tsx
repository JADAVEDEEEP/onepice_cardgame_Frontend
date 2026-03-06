import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { withApiBase } from '../data/apiBase';
import { Link } from 'react-router';

type SavedDeck = {
  _id: string;
  deck_name: string;
  leader?: { card_code?: string; name?: string; color?: string };
  deck_size: number;
  tags?: string[];
  createdAt: string;
};

export default function MyCollection() {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ total_pages: number; has_next?: boolean; has_prev?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedDecks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', '12');
      params.set('page', String(page));
      if (query.trim()) params.set('q', query.trim());
      const response = await fetch(withApiBase(`/decks?${params.toString()}`));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to load saved decks');
      }
      setDecks(Array.isArray(payload?.decks) ? payload.decks : []);
      setPagination(payload?.pagination || null);
    } catch (err) {
      setDecks([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : 'Failed to load saved decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSavedDecks();
  }, [page, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Collection</h1>
          <p className="text-[var(--text-secondary)]">Your saved public decks</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            placeholder="Search deck..."
            className="h-10 w-[180px] rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <Button variant="outline" onClick={() => void loadSavedDecks()}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading saved decks...</p>}
      {error && <p className="text-sm text-[var(--state-destructive)]">{error}</p>}

      {!loading && decks.length === 0 && (
        <Card className="p-12 bg-[var(--surface-1)] border-[var(--border-default)] text-center">
          <p className="text-[var(--text-muted)]">No saved decks found yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Save a deck from Deck Builder and it will appear here.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <Card key={deck._id} className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)]">{deck.deck_name}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Leader: {deck.leader?.name || deck.leader?.card_code || 'N/A'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Deck Size: {deck.deck_size}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Saved: {new Date(deck.createdAt).toLocaleString()}
            </p>
            {(deck.tags || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(deck.tags || []).slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--text-muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Link to={`/deck-compare?savedA=${deck._id}`} className="flex-1">
                <Button size="sm" className="w-full">Compare</Button>
              </Link>
              <Link to={`/matchup-matrix?savedDeck=${deck._id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full">Matrix</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">Page {page} / {pagination.total_pages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
