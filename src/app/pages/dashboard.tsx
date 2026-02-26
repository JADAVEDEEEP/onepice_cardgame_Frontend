import { KPICard } from '../components/kpi-card';
import { Trophy, TrendingUp, Target, AlertTriangle, BarChart, Star } from 'lucide-react';
import { ColorBadge } from '../components/color-badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockMetaData, mockDecks, colorStats } from '../data/mockData';
import { HeatmapGrid } from '../components/heatmap';
import { Link } from 'react-router';

// Sample trend data
const trendData = [
  { date: 'Feb 17', red: 68, blue: 62, green: 56, purple: 61, black: 55, yellow: 51 },
  { date: 'Feb 18', red: 67, blue: 63, green: 57, purple: 60, black: 54, yellow: 52 },
  { date: 'Feb 19', red: 69, blue: 62, green: 55, purple: 62, black: 55, yellow: 50 },
  { date: 'Feb 20', red: 68, blue: 64, green: 56, purple: 61, black: 56, yellow: 51 },
  { date: 'Feb 21', red: 67, blue: 63, green: 57, purple: 60, black: 54, yellow: 52 },
  { date: 'Feb 22', red: 66, blue: 62, green: 58, purple: 61, black: 55, yellow: 51 },
  { date: 'Feb 23', red: 65, blue: 63, green: 56, purple: 61, black: 54, yellow: 51 },
  { date: 'Feb 24', red: 65, blue: 62, green: 56, purple: 61, black: 55, yellow: 51 }
];

const pickRateData = mockMetaData.slice(0, 8).map(d => ({
  name: d.leader_name.split(' ').pop() || d.leader_name,
  value: d.pick_rate,
  color: d.color
}));

const colorMap: Record<string, string> = {
  red: 'var(--accent-red)',
  blue: 'var(--accent-blue)',
  green: 'var(--accent-green)',
  purple: 'var(--accent-purple)',
  black: 'var(--accent-black)',
  yellow: 'var(--accent-yellow)'
};

export default function Dashboard() {
  const heatmapData = [
    { row: 'Red Luffy', col: 'Purple Kaido', value: 48 },
    { row: 'Red Luffy', col: 'Blue Law', value: 55 },
    { row: 'Red Luffy', col: 'Green Zoro', value: 62 },
    { row: 'Purple Kaido', col: 'Red Luffy', value: 52 },
    { row: 'Purple Kaido', col: 'Blue Law', value: 42 },
    { row: 'Purple Kaido', col: 'Green Zoro', value: 48 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Your competitive analytics overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Overall Win Rate"
          value="65.2%"
          subtitle="Last 30 days"
          icon={Trophy}
          trend="up"
          trendValue="+2.3%"
          dataSource="matches.result"
        />
        <KPICard
          title="Best Color Today"
          value={<div className="flex items-center gap-2"><ColorBadge color="red" size="sm" /> Red</div>}
          subtitle="68.5% win rate"
          icon={Star}
          trend="up"
          trendValue="+1.2%"
          dataSource="meta.win_rate"
        />
        <KPICard
          title="Best Leader"
          value="Monkey D. Luffy"
          subtitle="OP01-016 · 68.5% WR"
          icon={Target}
          dataSource="meta.leader_code"
        />
        <KPICard
          title="Worst Matchup Alert"
          value={<div className="flex items-center gap-2"><ColorBadge color="purple" size="sm" /> Purple</div>}
          subtitle="48% vs Kaido"
          icon={AlertTriangle}
          trend="down"
          trendValue="-5.2%"
          dataSource="matches.result"
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
          value="92/100"
          subtitle="Excellent positioning"
          icon={TrendingUp}
          trend="up"
          trendValue="+5"
          dataSource="decks.meta_fit_score"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Trend Chart */}
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
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              Data: meta.win_rate, meta.date_window
            </p>
          </div>
        </Card>

        {/* Pick Rate Bar Chart */}
        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Top Leaders - Pick Rate</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Current meta snapshot</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={pickRateData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis type="number" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '12px' }} width={80} />
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
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              Data: meta.pick_rate, meta.leader_name
            </p>
          </div>
        </Card>
      </div>

      {/* Recommended Decks & Matchup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Decks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Recommended Decks</h3>
            <Link to="/deck-builder">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDecks.map((deck) => (
              <Card key={deck.deck_id} className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] hover:border-[var(--border-soft)] transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)] mb-1">{deck.deck_name}</h4>
                    <p className="text-xs font-mono text-[var(--text-muted)]">{deck.leader_code}</p>
                  </div>
                  <ColorBadge color={deck.primary_color} size="sm" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Win Rate</span>
                    <span className="font-medium text-[var(--state-success)]">{deck.win_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Consistency</span>
                    <span className="font-medium">{deck.consistency_score}/100</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">View</Button>
                  <Button size="sm" className="flex-1">Clone</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
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

      {/* Matchup Heatmap Preview */}
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
          data={heatmapData}
          rows={['Red Luffy', 'Purple Kaido']}
          cols={['Purple Kaido', 'Blue Law', 'Green Zoro']}
          onCellClick={(row, col) => console.log(`Clicked ${row} vs ${col}`)}
        />
        <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            Data: matches.result, decks.leader_code
          </p>
        </div>
      </Card>
    </div>
  );
}
