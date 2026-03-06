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
import { withApiBase } from '../data/apiBase';
import { Search, Filter, Save, Download, Sparkles, BarChart3, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type OptimizeSuggestion = {
  title: string;
  detail: string;
  candidates: CardType[];
};

type MatchupResult = {
  archetype: string;
  color: string;
  winRate: number;
  note: string;
};

type DeckPowerReport = {
  score: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    fill_score: number;
    counter_score: number;
    early_curve_score: number;
    event_balance_score: number;
    cost_balance_score: number;
    leader_score: number;
  };
};

type OptimizeAnalysis = {
  costCurve?: {
    phases?: {
      earlyGame?: { count: number; percent: number };
      midGame?: { count: number; percent: number };
      lateGame?: { count: number; percent: number };
    };
    issues?: string[];
  };
  roleBreakdown?: {
    typeCounts?: { characters: number; events: number; stages: number };
    roleCounts?: {
      blockers: number;
      removal: number;
      searchers: number;
      finishers: number;
      draw: number;
      boardControl: number;
    };
    missingRoles?: string[];
  };
  synergyScore?: { score: number; archetype?: string };
  consistencyScore?: { score: number };
  metaFitScore?: {
    score: number;
    byLeader?: Array<{ metaLeader: string; estimatedWinRate: number; confidence: string }>;
  };
  weaknesses?: string[];
  targetPlan?: {
    archetype: string;
    targets: Record<string, number>;
  };
  nextBestSwaps?: Array<{
    remove: { cardName: string; cardId: string };
    add: { cardName: string; cardId: string };
    reason: string;
    expectedImpact: number;
  }>;
  recommendedCards?: Array<{
    cardName: string;
    cardId: string;
    explanation: string;
  }>;
};

export default function DeckBuilder() {
  const [selectedLeader, setSelectedLeader] = useState<CardType | null>(null);
  const [deckCards, setDeckCards] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(90);
  const [optimizeSuggestions, setOptimizeSuggestions] = useState<OptimizeSuggestion[]>([]);
  const [optimizeAnalysis, setOptimizeAnalysis] = useState<OptimizeAnalysis | null>(null);
  const [matchupResults, setMatchupResults] = useState<MatchupResult[]>([]);
  const [deckPowerReport, setDeckPowerReport] = useState<DeckPowerReport | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeStatus, setOptimizeStatus] = useState<string | null>(null);
  const [lastOptimizedAt, setLastOptimizedAt] = useState<string | null>(null);
  const [lastSimulatedAt, setLastSimulatedAt] = useState<string | null>(null);
  const [savingDeck, setSavingDeck] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { cards, loading, error } = useCards();

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.card_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    return matchesSearch && matchesColor && matchesType;
  });
  const totalCards = Array.from(deckCards.values()).reduce((sum, count) => sum + count, 0);
  const visibleCards = filteredCards.slice(0, visibleCount);
  const deckProgress = Math.min((totalCards / 50) * 100, 100);
  const cardByCode = new Map(cards.map((card) => [card.card_code, card]));
  const selectedDeckCards = Array.from(deckCards.entries())
    .map(([code, count]) => {
      const card = cardByCode.get(code);
      if (!card) return null;
      return { card, count };
    })
    .filter((entry): entry is { card: CardType; count: number } => entry !== null);
  const uniqueCards = deckCards.size;
  const leadersCount = cards.filter((card) => card.type === 'leader').length;
  const counterCards = Array.from(deckCards.entries()).reduce((sum, [code, count]) => {
    const card = cardByCode.get(code);
    if (!card || card.counter_value <= 0) return sum;
    return sum + count;
  }, 0);
  const lowCostCards = selectedDeckCards.reduce((sum, { card, count }) => {
    if (card.cost <= 2) return sum + count;
    return sum;
  }, 0);
  const avgCost = totalCards === 0
    ? 0
    : Array.from(deckCards.entries()).reduce((sum, [code, count]) => {
      const card = cardByCode.get(code);
      return sum + (card?.cost || 0) * count;
    }, 0) / totalCards;
  const typeCounts = selectedDeckCards.reduce(
    (acc, { card, count }) => {
      acc[card.type] += count;
      return acc;
    },
    { leader: 0, character: 0, event: 0, stage: 0 }
  );
  const colorCounts = selectedDeckCards.reduce(
    (acc, { card, count }) => {
      acc[card.color] += count;
      return acc;
    },
    { red: 0, blue: 0, green: 0, purple: 0, black: 0, yellow: 0 }
  );
  const curveBuckets: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 };
  selectedDeckCards.forEach(({ card, count }) => {
    const key = card.cost >= 6 ? '6+' : String(Math.max(0, card.cost));
    curveBuckets[key] += count;
  });
  const curveData = [
    { cost: '0', count: curveBuckets['0'] },
    { cost: '1', count: curveBuckets['1'] },
    { cost: '2', count: curveBuckets['2'] },
    { cost: '3', count: curveBuckets['3'] },
    { cost: '4', count: curveBuckets['4'] },
    { cost: '5', count: curveBuckets['5'] },
    { cost: '6+', count: curveBuckets['6+'] }
  ];
  const activeCurveBuckets = curveData.filter((bucket) => bucket.count > 0).length;
  const counterDensity = totalCards === 0 ? 0 : Math.round((counterCards / totalCards) * 100);
  const curveCoverageScore = Math.round((activeCurveBuckets / curveData.length) * 100);
  const consistencyEstimate = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          Math.max(0, 50 - totalCards) * 1.4 -
          Math.max(0, 25 - counterDensity) * 0.9 -
          Math.max(0, 30 - Math.round((lowCostCards / Math.max(totalCards, 1)) * 100)) * 0.7 -
          (selectedLeader ? 0 : 10)
      )
    )
  );

  useEffect(() => {
    setVisibleCount(90);
  }, [searchTerm, colorFilter, typeFilter]);
  
  const addCard = (card: CardType) => {
    if (card.type === 'leader') {
      setSelectedLeader(card);
      return;
    }

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

  const clearFilters = () => {
    setSearchTerm('');
    setColorFilter('all');
    setTypeFilter('all');
  };

  const createOptimizeSuggestions = async () => {
    if (totalCards === 0) {
      setOptimizeStatus('Add cards first, then run optimize.');
      return;
    }

    setOptimizing(true);
    setOptimizeStatus('Running optimizer...');
    try {
      const payload = {
        leader: selectedLeader
          ? {
              card_code: selectedLeader.card_code,
              name: selectedLeader.name,
              color: selectedLeader.color,
              type: selectedLeader.type,
              cost: selectedLeader.cost,
              power: selectedLeader.power,
              counter: selectedLeader.counter_value,
              effect: selectedLeader.text_effect
            }
          : null,
        deck_size: totalCards,
        decklist: Array.from(deckCards.entries()).map(([card_code, count]) => {
          const card = cardByCode.get(card_code);
          return {
            card_code,
            count,
            card: {
              card_code,
              id: card_code,
              name: card?.name || card_code,
              cost: card?.cost || 0,
              power: card?.power || 0,
              type: card?.type || 'character',
              color: card?.color || 'red',
              counter: card?.counter_value || 0,
              effect: card?.text_effect || '',
              rarity: card?.rarity || '-',
              set_code: card?.set_code || 'SET',
              image_url: card?.image_url || ''
            }
          };
        })
      };

      const response = await fetch(withApiBase('/analytics/optimize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Optimize API failed with status ${response.status}`);
      }

      const data = await response.json();
      setOptimizeAnalysis(data as OptimizeAnalysis);
      if (data?.deck_power) {
        setDeckPowerReport(data.deck_power as DeckPowerReport);
      }
      setOptimizeStatus('Optimizer API result loaded.');
      const apiSuggestions: OptimizeSuggestion[] = Array.isArray(data?.suggestions)
        ? data.suggestions.map((item: any) => ({
            title: String(item?.title || 'Suggestion'),
            detail: String(item?.detail || ''),
            candidates: Array.isArray(item?.candidates)
              ? item.candidates.map((candidate: any) => ({
                  card_code: String(candidate?.card_code || candidate?.id || ''),
                  name: String(candidate?.name || 'Unknown'),
                  color: candidate?.color || 'red',
                  type: candidate?.type || 'character',
                  cost: Number(candidate?.cost) || 0,
                  power: Number(candidate?.power) || 0,
                  counter_value: Number(candidate?.counter_value) || 0,
                  traits: Array.isArray(candidate?.traits) ? candidate.traits : [],
                  text_effect: String(candidate?.text_effect || ''),
                  rarity: String(candidate?.rarity || '-'),
                  set_code: String(candidate?.set_code || 'SET'),
                  image_url: String(candidate?.image_url || '')
                }))
              : []
          }))
        : [];

      if (apiSuggestions.length > 0) {
        setOptimizeSuggestions(apiSuggestions);
      } else {
        setOptimizeSuggestions([
          {
            title: 'No API Suggestions',
            detail: 'Optimizer ran but returned no suggestions.',
            candidates: []
          }
        ]);
      }

      setLastOptimizedAt(new Date().toLocaleTimeString());
      return;
    } catch (error) {
      // Fallback to local heuristics if API call fails.
      console.error('Optimize API failed, using local logic:', error);
      setOptimizeStatus('API failed, using local optimization logic.');
      setOptimizeAnalysis(null);
    } finally {
      setOptimizing(false);
    }

    const localCounts = deckCards;
    const sameColorPool = cards.filter((card) => {
      if (card.type === 'leader') return false;
      if (!selectedLeader) return true;
      return card.color === selectedLeader.color;
    });

    const canAdd = (card: CardType) => (localCounts.get(card.card_code) || 0) < 4;
    const lowCostCandidates = sameColorPool
      .filter((card) => card.type === 'character' && card.cost <= 2 && canAdd(card))
      .sort((a, b) => (b.counter_value - a.counter_value) || (a.cost - b.cost))
      .slice(0, 3);
    const counterCandidates = sameColorPool
      .filter((card) => card.counter_value >= 1000 && canAdd(card))
      .sort((a, b) => (b.counter_value - a.counter_value) || (a.cost - b.cost))
      .slice(0, 3);
    const removalCandidates = sameColorPool
      .filter((card) => card.type === 'event' && /k\.o\.|rest|trash|delete/i.test(card.text_effect) && canAdd(card))
      .sort((a, b) => a.cost - b.cost)
      .slice(0, 3);

    const suggestions: OptimizeSuggestion[] = [];
    if (counterDensity < 30) {
      suggestions.push({
        title: 'Increase Defensive Density',
        detail: `Counter density is ${counterDensity}%. Add more +1000/+2000 counter cards to improve survivability.`,
        candidates: counterCandidates
      });
    }
    if (Math.round((lowCostCards / Math.max(totalCards, 1)) * 100) < 30) {
      suggestions.push({
        title: 'Improve Early Curve',
        detail: 'Your low-cost slot is thin. Add more 1-2 cost characters for smoother turn sequencing.',
        candidates: lowCostCandidates
      });
    }
    if (typeCounts.event < Math.max(6, Math.round(totalCards * 0.12))) {
      suggestions.push({
        title: 'Add Utility/Removal Events',
        detail: 'Event count is low for competitive pacing. Add flexible interaction cards.',
        candidates: removalCandidates
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        title: 'Deck Core Looks Balanced',
        detail: 'No major weaknesses detected. Focus on matchup-specific tech slots.',
        candidates: sameColorPool.filter((card) => canAdd(card)).slice(0, 3)
      });
    }

    setOptimizeSuggestions(suggestions);
    const localDeckPower = Math.max(
      0,
      Math.min(
        100,
        Math.round(consistencyEstimate * 0.55 + counterDensity * 0.2 + curveCoverageScore * 0.15 + (selectedLeader ? 10 : 0))
      )
    );
    setDeckPowerReport({
      score: localDeckPower,
      tier: localDeckPower >= 85 ? 'S' : localDeckPower >= 70 ? 'A' : localDeckPower >= 55 ? 'B' : localDeckPower >= 40 ? 'C' : 'D',
      breakdown: {
        fill_score: Math.round((totalCards / 50) * 100),
        counter_score: counterDensity,
        early_curve_score: Math.round((lowCostCards / Math.max(totalCards, 1)) * 100),
        event_balance_score: Math.round((typeCounts.event / Math.max(totalCards, 1)) * 100),
        cost_balance_score: Math.max(0, 100 - Math.round(Math.abs(avgCost - 3.2) * 25)),
        leader_score: selectedLeader ? 100 : 60
      }
    });
    setLastOptimizedAt(new Date().toLocaleTimeString());
  };

  const simulateMatchups = () => {
    const archetypes = [
      { archetype: 'Red Aggro', color: 'red' },
      { archetype: 'Blue Control', color: 'blue' },
      { archetype: 'Purple Ramp', color: 'purple' },
      { archetype: 'Black Midrange', color: 'black' },
      { archetype: 'Green Tempo', color: 'green' },
      { archetype: 'Yellow Life Combo', color: 'yellow' }
    ];

    const colorVsColor: Record<string, Record<string, number>> = {
      red: { red: 0, blue: 4, purple: -3, black: 1, green: 2, yellow: 5 },
      blue: { red: -4, blue: 0, purple: 3, black: 2, green: 1, yellow: 4 },
      purple: { red: 3, blue: -3, purple: 0, black: 1, green: 0, yellow: -2 },
      black: { red: -1, blue: -2, purple: -1, black: 0, green: 2, yellow: 3 },
      green: { red: -2, blue: -1, purple: 0, black: -2, green: 0, yellow: 2 },
      yellow: { red: -5, blue: -4, purple: 2, black: -3, green: -2, yellow: 0 }
    };

    const leaderColor = selectedLeader?.color || 'red';
    const base = Math.round(
      38 + (consistencyEstimate * 0.35) + (counterDensity * 0.15) + (curveCoverageScore * 0.12)
    );

    const results: MatchupResult[] = archetypes.map((meta) => {
      const colorMod = colorVsColor[leaderColor]?.[meta.color] || 0;
      const sizePenalty = totalCards < 45 ? -6 : 0;
      const lowCostMod = lowCostCards >= 12 ? 2 : -2;
      const winRate = Math.max(25, Math.min(75, base + colorMod + sizePenalty + lowCostMod));
      const note =
        winRate >= 60
          ? 'Favored if mulligan is stable.'
          : winRate >= 50
            ? 'Skill and sequencing matchup.'
            : 'Needs side tech and tighter play.';

      return { archetype: meta.archetype, color: meta.color, winRate, note };
    }).sort((a, b) => b.winRate - a.winRate);

    setMatchupResults(results);
    setLastSimulatedAt(new Date().toLocaleTimeString());
  };

  const saveDeckToApi = async () => {
    if (totalCards === 0) {
      setSaveStatus('Add cards first, then save deck.');
      return;
    }
    if (!selectedLeader) {
      setSaveStatus('Select leader before saving deck.');
      return;
    }

    try {
      setSavingDeck(true);
      setSaveStatus('Saving deck...');

      const payload = {
        deck_name: `${selectedLeader.name} Deck ${new Date().toLocaleDateString()}`,
        leader: {
          card_code: selectedLeader.card_code,
          name: selectedLeader.name,
          color: selectedLeader.color,
        },
        deck_cards: Array.from(deckCards.entries()).map(([card_code, count]) => ({ card_code, count })),
        tags: [selectedLeader.color, totalCards >= 50 ? 'competitive' : 'draft'],
        notes: '',
      };

      const response = await fetch(withApiBase('/decks/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || `Failed to save deck (${response.status})`);
      }
      setSaveStatus(`Saved: ${data.deck_name || payload.deck_name}`);
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to save deck');
    } finally {
      setSavingDeck(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-14)] border border-[var(--border-default)] bg-[var(--surface-1)] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Deck Builder</h1>
          <p className="text-[var(--text-secondary)]">Build and optimize your competitive deck with live cards data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => void saveDeckToApi()} disabled={savingDeck}>
            <Save className="w-4 h-4 mr-2" />
            {savingDeck ? 'Saving...' : 'Save Deck'}
          </Button>
        </div>
      </div>
      {saveStatus && <p className="text-xs text-[var(--text-muted)]">{saveStatus}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filters & Search */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Search & Filter</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
            
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Live Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Leaders Available</span>
                <span className="font-medium">{leadersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Unique Cards In Deck</span>
                <span className="font-medium">{uniqueCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Counter Cards</span>
                <span className="font-medium">{counterCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Average Cost</span>
                <span className="font-medium text-[var(--state-success)]">{avgCost.toFixed(1)}</span>
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

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs rounded-full bg-[var(--surface-2)] px-2 py-1 text-[var(--text-secondary)]">
                Color: {colorFilter}
              </span>
              <span className="text-xs rounded-full bg-[var(--surface-2)] px-2 py-1 text-[var(--text-secondary)]">
                Type: {typeFilter}
              </span>
              {searchTerm && (
                <span className="text-xs rounded-full bg-[var(--surface-2)] px-2 py-1 text-[var(--text-secondary)]">
                  Search: {searchTerm}
                </span>
              )}
            </div>

            {error && (
              <p className="text-sm text-[var(--state-destructive)] mb-4">
                Failed to load cards: {error}
              </p>
            )}

            {!loading && !error && filteredCards.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                No cards found for selected filters.
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
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 lg:self-start">
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
                  <Button size="sm" variant="ghost" onClick={() => setSelectedLeader(null)}>
                    Clear
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center">Select a Leader card from the grid</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-blue)] transition-all"
                  style={{ width: `${deckProgress}%` }}
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
                    const card = cardByCode.get(code);
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
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[var(--text-muted)]">Deck Power</p>
                      <span className="text-xs font-semibold">
                        {deckPowerReport ? `${deckPowerReport.tier} Tier` : 'Run Optimize'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--state-success)]"
                          style={{ width: `${deckPowerReport?.score ?? 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{deckPowerReport?.score ?? 0}/100</span>
                    </div>
                    {optimizeStatus && (
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{optimizeStatus}</p>
                    )}
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Consistency Estimate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--state-success)]" style={{ width: `${consistencyEstimate}%` }} />
                      </div>
                      <span className="text-sm font-semibold">{consistencyEstimate}/100</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Counter Density</span>
                      <span className="font-semibold">{counterDensity}%</span>
                    </div>
                    <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-blue)]" style={{ width: `${counterDensity}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Curve Coverage</span>
                      <span className="font-semibold">{curveCoverageScore}%</span>
                    </div>
                    <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-purple)]" style={{ width: `${curveCoverageScore}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">Type Spread</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span>Character</span><span>{typeCounts.character}</span></div>
                      <div className="flex justify-between"><span>Event</span><span>{typeCounts.event}</span></div>
                      <div className="flex justify-between"><span>Stage</span><span>{typeCounts.stage}</span></div>
                      <div className="flex justify-between"><span>Main Deck</span><span>{totalCards}</span></div>
                      <div className="flex justify-between"><span>Leader Slot</span><span>{selectedLeader ? 'Filled' : 'Empty'}</span></div>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-lg space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">Color Spread</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Main deck colors only (leader excluded)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span>Red</span><span>{colorCounts.red}</span></div>
                      <div className="flex justify-between"><span>Blue</span><span>{colorCounts.blue}</span></div>
                      <div className="flex justify-between"><span>Green</span><span>{colorCounts.green}</span></div>
                      <div className="flex justify-between"><span>Purple</span><span>{colorCounts.purple}</span></div>
                      <div className="flex justify-between"><span>Black</span><span>{colorCounts.black}</span></div>
                      <div className="flex justify-between"><span>Yellow</span><span>{colorCounts.yellow}</span></div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={createOptimizeSuggestions} disabled={optimizing}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {optimizing ? 'Optimizing...' : 'Optimize Deck'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={simulateMatchups}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Simulate Matchups
                  </Button>
                  {optimizeAnalysis && (
                    <div className="p-3 bg-[var(--surface-2)] rounded-lg space-y-3">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">API Deck Analysis</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded border border-[var(--border-default)] p-2 text-center">
                          <p className="text-[10px] text-[var(--text-muted)]">Synergy</p>
                          <p className="font-semibold">{optimizeAnalysis.synergyScore?.score ?? 0}/100</p>
                        </div>
                        <div className="rounded border border-[var(--border-default)] p-2 text-center">
                          <p className="text-[10px] text-[var(--text-muted)]">Consistency</p>
                          <p className="font-semibold">{optimizeAnalysis.consistencyScore?.score ?? 0}/100</p>
                        </div>
                        <div className="rounded border border-[var(--border-default)] p-2 text-center">
                          <p className="text-[10px] text-[var(--text-muted)]">Meta Fit</p>
                          <p className="font-semibold">{optimizeAnalysis.metaFitScore?.score ?? 0}/100</p>
                        </div>
                      </div>

                      <div className="rounded border border-[var(--border-default)] p-2">
                        <p className="text-xs font-medium mb-1">Cost Curve (API)</p>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div className="flex justify-between"><span>Early</span><span>{optimizeAnalysis.costCurve?.phases?.earlyGame?.percent ?? 0}%</span></div>
                          <div className="flex justify-between"><span>Mid</span><span>{optimizeAnalysis.costCurve?.phases?.midGame?.percent ?? 0}%</span></div>
                          <div className="flex justify-between"><span>Late</span><span>{optimizeAnalysis.costCurve?.phases?.lateGame?.percent ?? 0}%</span></div>
                        </div>
                        {(optimizeAnalysis.costCurve?.issues?.length ?? 0) > 0 && (
                          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                            Issue: {optimizeAnalysis.costCurve?.issues?.[0]}
                          </p>
                        )}
                      </div>

                      <div className="rounded border border-[var(--border-default)] p-2">
                        <p className="text-xs font-medium mb-1">Role Breakdown (API)</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex justify-between"><span>Character</span><span>{optimizeAnalysis.roleBreakdown?.typeCounts?.characters ?? 0}</span></div>
                          <div className="flex justify-between"><span>Event</span><span>{optimizeAnalysis.roleBreakdown?.typeCounts?.events ?? 0}</span></div>
                          <div className="flex justify-between"><span>Stage</span><span>{optimizeAnalysis.roleBreakdown?.typeCounts?.stages ?? 0}</span></div>
                          <div className="flex justify-between"><span>Blockers</span><span>{optimizeAnalysis.roleBreakdown?.roleCounts?.blockers ?? 0}</span></div>
                          <div className="flex justify-between"><span>Removal</span><span>{optimizeAnalysis.roleBreakdown?.roleCounts?.removal ?? 0}</span></div>
                          <div className="flex justify-between"><span>Searchers</span><span>{optimizeAnalysis.roleBreakdown?.roleCounts?.searchers ?? 0}</span></div>
                        </div>
                      </div>

                      {(optimizeAnalysis.weaknesses?.length ?? 0) > 0 && (
                        <div className="rounded border border-[var(--border-default)] p-2">
                          <p className="text-xs font-medium mb-1">Detected Weaknesses</p>
                          <div className="space-y-1">
                            {optimizeAnalysis.weaknesses?.slice(0, 5).map((weak) => (
                              <p key={weak} className="text-[11px] text-[var(--text-secondary)]">- {weak}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {optimizeAnalysis.targetPlan && (
                        <div className="rounded border border-[var(--border-default)] p-2">
                          <p className="text-xs font-medium mb-1">
                            Target Plan ({optimizeAnalysis.targetPlan.archetype})
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {Object.entries(optimizeAnalysis.targetPlan.targets).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key.replace(/_/g, ' ')}</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(optimizeAnalysis.nextBestSwaps?.length ?? 0) > 0 && (
                        <div className="rounded border border-[var(--border-default)] p-2">
                          <p className="text-xs font-medium mb-1">Next Best Swaps</p>
                          <div className="space-y-2">
                            {optimizeAnalysis.nextBestSwaps?.slice(0, 3).map((swap, idx) => (
                              <div key={`${swap.add.cardId}-${swap.remove.cardId}-${idx}`} className="text-[11px]">
                                <p className="font-medium">{swap.remove.cardId} {'->'} {swap.add.cardId}</p>
                                <p className="text-[var(--text-secondary)]">{swap.reason} ({swap.expectedImpact})</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(optimizeAnalysis.recommendedCards?.length ?? 0) > 0 && (
                        <div className="rounded border border-[var(--border-default)] p-2">
                          <p className="text-xs font-medium mb-1">Recommended Cards</p>
                          <div className="space-y-2">
                            {optimizeAnalysis.recommendedCards?.slice(0, 5).map((rec) => (
                              <div key={rec.cardId} className="text-[11px]">
                                <p className="font-medium">{rec.cardName} ({rec.cardId})</p>
                                <p className="text-[var(--text-secondary)]">{rec.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {optimizeSuggestions.length > 0 && (
                    <div className="p-3 bg-[var(--surface-2)] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Optimization Suggestions</p>
                        {lastOptimizedAt && <span className="text-[10px] text-[var(--text-muted)]">{lastOptimizedAt}</span>}
                      </div>
                      {optimizeSuggestions.map((suggestion) => (
                        <div key={suggestion.title} className="rounded-md border border-[var(--border-default)] p-2">
                          <p className="text-xs font-medium">{suggestion.title}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] mb-2">{suggestion.detail}</p>
                          <div className="space-y-1">
                            {suggestion.candidates.map((candidate) => (
                              <div key={candidate.card_code} className="flex items-center justify-between text-[11px]">
                                <span className="truncate mr-2">{candidate.name}</span>
                                <span className="text-[var(--text-muted)]">{candidate.card_code}</span>
                              </div>
                            ))}
                            {suggestion.candidates.length === 0 && (
                              <p className="text-[11px] text-[var(--text-muted)]">No candidate cards found in pool.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {matchupResults.length > 0 && (
                    <div className="p-3 bg-[var(--surface-2)] rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Matchup Simulation</p>
                        {lastSimulatedAt && <span className="text-[10px] text-[var(--text-muted)]">{lastSimulatedAt}</span>}
                      </div>
                      {matchupResults.map((matchup) => (
                        <div key={matchup.archetype} className="rounded-md border border-[var(--border-default)] p-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">{matchup.archetype}</p>
                            <span className="text-xs font-semibold">{matchup.winRate}%</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)]">{matchup.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
