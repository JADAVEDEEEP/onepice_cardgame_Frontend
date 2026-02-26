import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ColorBadge } from '../components/color-badge';
import { HeatmapGrid } from '../components/heatmap';
import { mockDecks, mockCards } from '../data/mockData';
import { Share2, Download, Edit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DeckAnalytics() {
  const deck = mockDecks[0];

  const typeDistribution = [
    { name: 'Characters', value: 35, color: 'var(--accent-blue)' },
    { name: 'Events', value: 12, color: 'var(--accent-red)' },
    { name: 'Stages', value: 3, color: 'var(--accent-green)' }
  ];

  const cardContribution = [
    { card: 'OP01-031', name: 'Nami', drawnWR: 72.5, mulliganKeep: 85, synergy: 9.2 },
    { card: 'OP01-047', name: 'Radical Beam', drawnWR: 68.3, mulliganKeep: 45, synergy: 8.5 },
    { card: 'OP02-036', name: 'Gum-Gum Red Roc', drawnWR: 65.2, mulliganKeep: 15, synergy: 7.8 }
  ];

  const mulliganExamples = [
    {
      hand: ['OP01-031', 'OP01-047', 'Land', 'Land', 'OP02-036'],
      decision: 'KEEP',
      reason: 'Perfect curve with early game presence'
    },
    {
      hand: ['High Cost', 'High Cost', 'Land', 'Land', 'Land'],
      decision: 'MULLIGAN',
      reason: 'No early plays, will brick'
    }
  ];

  const heatmapData = [
    { row: 'Your Deck', col: 'Red Luffy', value: 68 },
    { row: 'Your Deck', col: 'Purple Kaido', value: 48 },
    { row: 'Your Deck', col: 'Blue Law', value: 55 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{deck.deck_name}</h1>
          <div className="flex items-center gap-3">
            <ColorBadge color={deck.primary_color} size="sm" />
            <span className="text-sm font-mono text-[var(--text-muted)]">{deck.leader_code}</span>
            <span className="text-sm text-[var(--text-secondary)]">• {deck.tags.join(', ')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Deck
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matchups">Matchups</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="contribution">Card Contribution</TabsTrigger>
          <TabsTrigger value="mulligan">Mulligan Guide</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-muted)] mb-2">Win Rate</p>
              <p className="text-3xl font-bold text-[var(--state-success)]">{deck.win_rate}%</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Based on 142 matches</p>
            </Card>
            <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-muted)] mb-2">Consistency</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{deck.consistency_score}/100</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Above average</p>
            </Card>
            <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-muted)] mb-2">Meta Fit</p>
              <p className="text-3xl font-bold text-[var(--accent-blue)]">{deck.meta_fit_score}/100</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Excellent positioning</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Card Type Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {typeDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-[var(--text-secondary)]">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Going First vs Second</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">Going First</span>
                    <span className="text-sm font-semibold text-[var(--state-success)]">72.3% WR</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--state-success)]" style={{ width: '72.3%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">Going Second</span>
                    <span className="text-sm font-semibold">64.8% WR</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-blue)]" style={{ width: '64.8%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border-soft)]">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--state-success)]">+7.5%</span> advantage going first
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Matchups Tab */}
        <TabsContent value="matchups" className="space-y-6 mt-6">
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Your Deck vs Top Leaders</h3>
            <HeatmapGrid
              data={heatmapData}
              rows={['Your Deck']}
              cols={['Red Luffy', 'Purple Kaido', 'Blue Law']}
              onCellClick={(row, col) => console.log(`${row} vs ${col}`)}
            />
          </Card>
        </TabsContent>

        {/* Card Contribution Tab */}
        <TabsContent value="contribution" className="space-y-6 mt-6">
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Card Performance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Card Code</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Drawn Win Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Mulligan Keep %</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Synergy Score</th>
                  </tr>
                </thead>
                <tbody>
                  {cardContribution.map((card) => (
                    <tr key={card.card} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)]">
                      <td className="py-3 px-4 font-mono text-xs">{card.card}</td>
                      <td className="py-3 px-4">{card.name}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--state-success)]">{card.drawnWR}%</td>
                      <td className="py-3 px-4">{card.mulliganKeep}%</td>
                      <td className="py-3 px-4">{card.synergy}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Mulligan Guide Tab */}
        <TabsContent value="mulligan" className="space-y-6 mt-6">
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Mulligan Decision Examples</h3>
            <div className="space-y-4">
              {mulliganExamples.map((example, idx) => (
                <div key={idx} className="p-4 bg-[var(--surface-2)] rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      example.decision === 'KEEP' 
                        ? 'bg-[var(--state-success)]/20 text-[var(--state-success)]'
                        : 'bg-[var(--state-danger)]/20 text-[var(--state-danger)]'
                    }`}>
                      {example.decision}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {example.hand.map((card, i) => (
                      <div key={i} className="px-3 py-2 bg-[var(--surface-3)] rounded text-xs font-mono">
                        {card}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{example.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
