import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ColorBadge } from '../components/color-badge';
import { mockDecks } from '../data/mockData';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DeckCompare() {
  const radarData = [
    { stat: 'Aggression', deckA: 85, deckB: 45 },
    { stat: 'Control', deckA: 35, deckB: 80 },
    { stat: 'Consistency', deckA: 85, deckB: 78 },
    { stat: 'Tempo', deckA: 90, deckB: 60 },
    { stat: 'Resilience', deckA: 40, deckB: 85 },
    { stat: 'Skill', deckA: 70, deckB: 85 }
  ];

  const statsComparison = [
    { metric: 'Win Rate', deckA: '68.5%', deckB: '62.3%', winner: 'A' },
    { metric: 'Consistency', deckA: '85/100', deckB: '78/100', winner: 'A' },
    { metric: 'Tempo Score', deckA: '9.2/10', deckB: '7.8/10', winner: 'A' },
    { metric: 'Meta Fit', deckA: '92/100', deckB: '85/100', winner: 'A' },
    { metric: 'Skill Rating', deckA: '7/10', deckB: '8/10', winner: 'B' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Deck Compare</h1>
        <p className="text-[var(--text-secondary)]">Side-by-side analysis of two decks</p>
      </div>

      {/* Deck Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] mb-2">Deck A</p>
          <Select defaultValue="deck_001">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockDecks.map((deck) => (
                <SelectItem key={deck.deck_id} value={deck.deck_id}>
                  {deck.deck_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex items-center gap-2">
            <ColorBadge color={mockDecks[0].primary_color} size="sm" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{mockDecks[0].leader_code}</span>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] mb-2">Deck B</p>
          <Select defaultValue="deck_002">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockDecks.map((deck) => (
                <SelectItem key={deck.deck_id} value={deck.deck_id}>
                  {deck.deck_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex items-center gap-2">
            <ColorBadge color={mockDecks[1].primary_color} size="sm" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{mockDecks[1].leader_code}</span>
          </div>
        </Card>
      </div>

      {/* Stats Comparison */}
      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Key Metrics</h3>
        <div className="space-y-3">
          {statsComparison.map((stat) => (
            <div key={stat.metric} className="flex items-center gap-4">
              <div className="w-32 text-sm text-[var(--text-secondary)]">{stat.metric}</div>
              <div className={`flex-1 text-sm font-semibold ${stat.winner === 'A' ? 'text-[var(--state-success)]' : ''}`}>
                {stat.deckA}
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
              <div className={`flex-1 text-sm font-semibold text-right ${stat.winner === 'B' ? 'text-[var(--state-success)]' : ''}`}>
                {stat.deckB}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Radar Chart */}
      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Playstyle Profile</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border-default)" />
            <PolarAngleAxis dataKey="stat" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
            <PolarRadiusAxis stroke="var(--text-muted)" />
            <Radar name="Deck A" dataKey="deckA" stroke="var(--accent-red)" fill="var(--accent-red)" fillOpacity={0.3} />
            <Radar name="Deck B" dataKey="deckB" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recommendation */}
      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recommendation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--state-success)]" />
              <p className="font-semibold text-[var(--text-primary)]">Choose Deck A if...</p>
            </div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li>• You prefer aggressive, tempo-based gameplay</li>
              <li>• You want higher win rates in current meta</li>
              <li>• You need a more consistent deck</li>
              <li>• You're playing in faster-paced formats</li>
            </ul>
          </div>
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-[var(--accent-purple)]" />
              <p className="font-semibold text-[var(--text-primary)]">Choose Deck B if...</p>
            </div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li>• You prefer control and late-game strategies</li>
              <li>• You're comfortable with higher skill ceiling</li>
              <li>• You want better resilience against aggro</li>
              <li>• You enjoy longer, strategic games</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
