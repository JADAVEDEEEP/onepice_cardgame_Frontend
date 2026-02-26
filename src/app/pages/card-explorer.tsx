import { Card } from '../components/ui/card';
import { CardTile } from '../components/card-tile';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useCards } from '../data/cardsApi';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CardExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const { cards, loading, error } = useCards();
  
  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.card_code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleCards = filteredCards.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(60);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Card Explorer</h1>
        <p className="text-[var(--text-secondary)]">Search and explore the complete card database</p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <Input
              type="text"
              placeholder="Search by card name or code (e.g., OP01-016)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
          <Button variant="outline" size="lg">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-muted)]">
            {loading ? 'Loading cards...' : `${filteredCards.length} cards found`}
          </p>
        </div>

        {error && (
          <p className="text-sm text-[var(--state-destructive)] mb-4">
            Failed to load cards: {error}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleCards.map((card) => (
            <CardTile key={card.card_code} card={card} />
          ))}
        </div>

        {!loading && !error && filteredCards.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] mt-4">No cards match your search.</p>
        )}

        {!loading && !error && filteredCards.length > visibleCards.length && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 60)}>
              Load More Cards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
