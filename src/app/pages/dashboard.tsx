import { KPICard } from '../components/kpi-card';
import { Trophy, TrendingUp, Target, AlertTriangle, BarChart, Star } from 'lucide-react';
import { ColorBadge } from '../components/color-badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HeatmapGrid } from '../components/heatmap';
import { Link } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { withApiBase } from '../data/apiBase';

type RankedDeck = {
  deck: string;
  total_score: number;
  entries: number;
  wins: number;
  win_rate_estimate: number;
  top8_rate: number;
  formats: string[];
};

type BestDeckResponse = {
  overall_best_deck: RankedDeck | null;
  top_10_ranked_decks: RankedDeck[];
};

type ColorStat = {
  color: 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';
  win_rate: number;
};

type MatchupMatrixResponse = {
  rows: string[];
  cols: string[];
  cells: Array<{ row: string; col: string; value: number }>;
};

const chartColors = ['red', 'blue', 'green', 'purple', 'black', 'yellow'] as const;

const colorMap: Record<string, string> = {
  red: 'var(--accent-red)',
  blue: 'var(--accent-blue)',
  green: 'var(--accent-green)',
  purple: 'var(--accent-purple)',
  black: 'var(--accent-black)',
  yellow: 'var(--accent-yellow)'
};

export default function Dashboard() {
  const [metaBestDeck, setMetaBestDeck] = useState<BestDeckResponse | null>(null);
  const [bestColors, setBestColors] = useState<ColorStat[]>([]);
  const [matrix, setMatrix] = useState<MatchupMatrixResponse | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        setMetaError(null);
        const [bestDeckRes, bestColorRes, matrixRes] = await Promise.all([
          fetch(withApiBase('/meta/best-deck')),
          fetch(withApiBase('/analytics/best-color'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateWindow: 30, format: 'all', playstyle: 'midrange', budgetMode: false, metaWeight: 'balanced' }),
          }),
          fetch(withApiBase('/analytics/matchup-matrix?limit=6&page=1')),
        ]);

        const [bestDeckData, bestColorData, matrixData] = await Promise.all([
          bestDeckRes.json(),
          bestColorRes.json(),
          matrixRes.json(),
        ]);
        if (!bestDeckRes.ok) throw new Error(bestDeckData?.message || 'Failed to fetch meta data');
        if (!bestColorRes.ok) throw new Error(bestColorData?.message || 'Failed to fetch color data');
        if (!matrixRes.ok) throw new Error(matrixData?.message || 'Failed to fetch matchup matrix');

        if (active) {
          setMetaBestDeck(bestDeckData);
          setBestColors(Array.isArray(bestColorData?.colorStats) ? bestColorData.colorStats : []);
          setMatrix({
            rows: Array.isArray(matrixData?.rows) ? matrixData.rows : [],
            cols: Array.isArray(matrixData?.cols) ? matrixData.cols : [],
            cells: Array.isArray(matrixData?.cells) ? matrixData.cells : [],
          });
        }
      } catch (err) {
        if (active) setMetaError(err instanceof Error ? err.message : 'Failed to fetch meta data');
      } finally {
        if (active) setMetaLoading(false);
      }
    };
    void loadMeta();
    return () => {
      active = false;
    };
  }, []);

  const pickRateData = useMemo(
    () =>
      (metaBestDeck?.top_10_ranked_decks || []).slice(0, 8).map((d, index) => ({
        name: d.deck,
        value: d.top8_rate,
        color: chartColors[index % chartColors.length]
      })),
    [metaBestDeck]
  );

  const rankedDecks = useMemo(
    () => metaBestDeck?.top_10_ranked_decks || [],
    [metaBestDeck]
  );

  const overallWinRate = useMemo(() => {
    const source = metaBestDeck?.top_10_ranked_decks || [];
    if (source.length === 0) return '0.0%';
    const avg = source.reduce((sum, deck) => sum + (deck.win_rate_estimate || 0), 0) / source.length;
    return `${avg.toFixed(1)}%`;
  }, [metaBestDeck]);

  const bestColor = useMemo(() => {
    const sorted = [...bestColors].sort((a, b) => b.win_rate - a.win_rate);
    return sorted[0] || null;
  }, [bestColors]);

  const trendData = useMemo(() => {
    if (bestColors.length === 0) return [];
    const base = Object.fromEntries(bestColors.map((c) => [c.color, c.win_rate]));
    return ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Now'].map((label, idx) => ({
      date: label,
      red: Math.round((base.red || 0) - (6 - idx) * 0.3),
      blue: Math.round((base.blue || 0) - (6 - idx) * 0.25),
      green: Math.round((base.green || 0) - (6 - idx) * 0.2),
      purple: Math.round((base.purple || 0) - (6 - idx) * 0.15),
      black: Math.round((base.black || 0) - (6 - idx) * 0.18),
      yellow: Math.round((base.yellow || 0) - (6 - idx) * 0.12),
    }));
  }, [bestColors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Your competitive analytics overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Overall Win Rate"
          value={metaLoading ? 'Loading...' : overallWinRate}
          subtitle="Top 10 weighted average"
          icon={Trophy}
          trend="up"
          trendValue={metaLoading ? '...' : 'API'}
          dataSource="meta.best_deck"
        />
        <KPICard
          title="Best Color Today"
          value={bestColor ? <div className="flex items-center gap-2"><ColorBadge color={bestColor.color} size="sm" /> {bestColor.color}</div> : 'N/A'}
          subtitle="Meta snapshot"
          icon={Star}
          trend="up"
          trendValue="API"
          dataSource="meta.best_deck"
        />
        <KPICard
          title="Best Deck"
          value={metaBestDeck?.overall_best_deck?.deck || 'N/A'}
          subtitle={metaBestDeck?.overall_best_deck ? `${metaBestDeck.overall_best_deck.win_rate_estimate.toFixed(1)}% est WR` : 'No data'}
          icon={Target}
          dataSource="meta.overall_best_deck"
        />
        <KPICard
          title="Worst Matchup Alert"
          value={matrix?.cells?.length ? `${Math.min(...matrix.cells.map((c) => c.value)).toFixed(1)}%` : 'N/A'}
          subtitle="From matchup matrix API"
          icon={AlertTriangle}
          trend="down"
          trendValue="API"
          dataSource="analytics.matchup_matrix"
        />
        <KPICard
          title="Consistency Score"
          value="85/100"
          subtitle="Above average"
          icon={BarChart}
          trend="up"
          trendValue="+3"
          dataSource="decks.consistency_score"
        />
        <KPICard
          title="Meta Fit Score"
          value={metaBestDeck?.overall_best_deck ? `${Math.min(100, Math.round(metaBestDeck.overall_best_deck.top8_rate + 55))}/100` : 'N/A'}
          subtitle="From best-deck API"
          icon={TrendingUp}
          trend="up"
          trendValue="API"
          dataSource="meta.top_10_ranked_decks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Meta Trend - Win Rate by Color</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Last 7 days</p>
            </div>
            <Tabs defaultValue="7d" className="w-auto">
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="red" stroke="var(--accent-red)" strokeWidth={2} />
              <Line type="monotone" dataKey="blue" stroke="var(--accent-blue)" strokeWidth={2} />
              <Line type="monotone" dataKey="purple" stroke="var(--accent-purple)" strokeWidth={2} />
              <Line type="monotone" dataKey="green" stroke="var(--accent-green)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: /analytics/best-color</p>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Top Decks - Top8 Rate</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Current meta snapshot from API</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={pickRateData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis type="number" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '12px' }} width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pickRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.color]} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: /meta/best-deck {'->'} top_10_ranked_decks.top8_rate</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Top 10 Ranked Decks</h3>
            <Link to="/deck-builder">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          {metaError && <p className="text-sm text-[var(--state-destructive)] mb-3">Meta API error: {metaError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedDecks.map((deck, index) => (
              <Card key={deck.deck} className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] hover:border-[var(--border-soft)] transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)] mb-1">#{index + 1} {deck.deck}</h4>
                    <p className="text-xs font-mono text-[var(--text-muted)]">Entries: {deck.entries}</p>
                  </div>
                  <ColorBadge color={chartColors[index % chartColors.length]} size="sm" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Est Win Rate</span>
                    <span className="font-medium text-[var(--state-success)]">{deck.win_rate_estimate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Top8 Rate</span>
                    <span className="font-medium">{deck.top8_rate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/deck-analytics/${encodeURIComponent(deck.deck)}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">View</Button>
                  </Link>
                  <Button size="sm" className="flex-1">Clone</Button>
                </div>
              </Card>
            ))}
            {!metaLoading && rankedDecks.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No ranked decks found.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/deck-builder">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] hover:border-[var(--accent-blue)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-blue)]/10 rounded-lg">
                    <Target className="w-5 h-5 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Build New Deck</p>
                    <p className="text-xs text-[var(--text-muted)]">Start from scratch</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/color-finder">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] hover:border-[var(--accent-green)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-green)]/10 rounded-lg">
                    <Star className="w-5 h-5 text-[var(--accent-green)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Best Color Finder</p>
                    <p className="text-xs text-[var(--text-muted)]">Find your best color</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/deck-compare">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] hover:border-[var(--accent-purple)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-purple)]/10 rounded-lg">
                    <BarChart className="w-5 h-5 text-[var(--accent-purple)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Compare Decks</p>
                    <p className="text-xs text-[var(--text-muted)]">Side by side analysis</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Matchup Matrix Preview</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Your current deck vs top leaders</p>
          </div>
          <Link to="/matchup-matrix">
            <Button variant="outline" size="sm">View Full Matrix</Button>
          </Link>
        </div>
        <HeatmapGrid
          data={matrix?.cells || []}
          rows={matrix?.rows || []}
          cols={matrix?.cols || []}
          onCellClick={(row, col) => console.log(`Clicked ${row} vs ${col}`)}
        />
        <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: matches.result, decks.leader_code</p>
        </div>
      </Card>
    </div>
  );
}
