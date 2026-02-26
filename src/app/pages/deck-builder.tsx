import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { CardTile } from '../components/card-tile';
import { Card as CardType } from '../data/mockData';
import { useCards } from '../data/cardsApi';
import { Search, Filter, Save, Download, Sparkles, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeckBuilder() {
  const [selectedLeader, setSelectedLeader] = useState<CardType | null>(null);
  const [deckCards, setDeckCards] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(90);
  const { cards, loading, error } = useCards();

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.card_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    return matchesSearch && matchesColor;
  });
  const visibleCards = filteredCards.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(90);
  }, [searchTerm, colorFilter]);

  const totalCards = Array.from(deckCards.values()).reduce((sum, count) => sum + count, 0);
  
  const addCard = (card: CardType) => {
    const current = deckCards.get(card.card_code) || 0;
    if (current < 4 && totalCards < 50) {
      const newDeck = new Map(deckCards);
      newDeck.set(card.card_code, current + 1);
      setDeckCards(newDeck);
    }
  };

  const removeCard = (card: CardType) => {
    const current = deckCards.get(card.card_code) || 0;
    if (current > 0) {
      const newDeck = new Map(deckCards);
      if (current === 1) {
        newDeck.delete(card.card_code);
      } else {
        newDeck.set(card.card_code, current - 1);
      }
      setDeckCards(newDeck);
    }
  };

  // Mock curve data
  const curveData = [
    { cost: '0', count: 1 },
    { cost: '1', count: 4 },
    { cost: '2', count: 8 },
    { cost: '3', count: 12 },
    { cost: '4', count: 10 },
    { cost: '5', count: 7 },
    { cost: '6+', count: 8 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Deck Builder</h1>
          <p className="text-[var(--text-secondary)]">Build and optimize your competitive deck</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Deck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filters & Search */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Search & Filter</h3>
            
            {/* Search */}
            <div className="mb-4">
              <Label>Search Cards</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  placeholder="Name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-4">
              <Label>Color</Label>
              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <Label>Type</Label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Owned Only */}
            <div className="flex items-center justify-between">
              <Label>Show Owned Only</Label>
              <Switch checked={showOwnedOnly} onCheckedChange={setShowOwnedOnly} />
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </Card>

          <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Counter Density</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Removal Count</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Draw/Search</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Tempo Score</span>
                <span className="font-medium text-[var(--state-success)]">8.2/10</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle: Card Grid */}
        <div className="lg:col-span-6">
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Available Cards</h3>
              <p className="text-sm text-[var(--text-muted)]">
                {loading ? 'Loading cards...' : `${filteredCards.length} cards found`}
              </p>
            </div>

            {error && (
              <p className="text-sm text-[var(--state-destructive)] mb-4">
                Failed to load cards: {error}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto pr-2">
              {visibleCards.map((card) => (
                <CardTile
                  key={card.card_code}
                  card={card}
                  onAdd={addCard}
                  onRemove={removeCard}
                  count={deckCards.get(card.card_code) || 0}
                  synergy={card.type === 'event' ? 'removal' : null}
                />
              ))}
            </div>

            {!loading && !error && filteredCards.length > visibleCards.length && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 90)}>
                  Load More Cards
                </Button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[var(--border-soft)]">
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                Data: cards.card_code, cards.name, cards.color
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Deck Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Your Deck</h3>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{totalCards}/50</span>
            </div>

            {/* Leader Slot */}
            <div className="mb-4 p-3 bg-[var(--surface-2)] rounded-lg border-2 border-dashed border-[var(--border-default)]">
              {selectedLeader ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-16 bg-[var(--surface-3)] rounded overflow-hidden">
                    <img src={selectedLeader.image_url} alt={selectedLeader.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedLeader.name}</p>
                    <p className="text-xs font-mono text-[var(--text-muted)]">{selectedLeader.card_code}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center">Select Leader</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-blue)] transition-all"
                  style={{ width: `${(totalCards / 50) * 100}%` }}
                />
              </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">List</TabsTrigger>
                <TabsTrigger value="curve" className="flex-1">Curve</TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {Array.from(deckCards.entries()).map(([code, count]) => {
                    const card = cards.find(c => c.card_code === code);
                    if (!card) return null;
                    return (
                      <div key={code} className="flex items-center gap-2 p-2 bg-[var(--surface-2)] rounded">
                        <span className="font-mono text-sm w-6">{count}x</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{card.name}</p>
                          <p className="text-xs font-mono text-[var(--text-muted)]">{card.card_code}</p>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{card.cost}</span>
                      </div>
                    );
                  })}
                  {totalCards === 0 && (
                    <p className="text-sm text-[var(--text-muted)] text-center py-8">
                      No cards added yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="curve" className="mt-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="cost" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Consistency Estimate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--state-success)]" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm font-semibold">85/100</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimize Deck
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Simulate Matchups
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
