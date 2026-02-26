import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ColorBadge } from '../components/color-badge';
import { colorStats, OPTCGColor, mockCards } from '../data/mockData';
import { Target, TrendingUp, AlertTriangle, BarChart, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export default function BestColorFinder() {
  const [dateWindow, setDateWindow] = useState('30');
  const [format, setFormat] = useState('all');
  const [playstyle, setPlaystyle] = useState([50]);
  const [goingFirst, setGoingFirst] = useState('any');
  const [budgetMode, setBudgetMode] = useState(false);
  const [metaWeight, setMetaWeight] = useState('balanced');

  const sortedColors = [...colorStats].sort((a, b) => b.win_rate - a.win_rate);
  const topColor = sortedColors[0];
  const secondColor = sortedColors[1];
  const thirdColor = sortedColors[2];
  const wildcardColor = sortedColors[sortedColors.length - 2]; // Not last, second to last

  const getPlaystyleLabel = (value: number) => {
    if (value < 33) return 'Aggro';
    if (value < 67) return 'Midrange';
    return 'Control';
  };

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'matchup': return <Target className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'consistency': return <BarChart className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const reasons = [
    { type: 'matchup', text: 'Favorable against 4 of top 6 meta leaders' },
    { type: 'trend', text: 'Win rate increased 2.3% in last 7 days' },
    { type: 'consistency', text: 'High consistency score (88/100) for reliable performance' },
    { type: 'meta', text: 'Strong positioning against current meta trends' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Best Color Finder</h1>
        <p className="text-[var(--text-secondary)]">Discover the optimal color for your playstyle and the current meta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Panel */}
        <Card className="lg:col-span-3 p-6 bg-[var(--surface-1)] border-[var(--border-default)] h-fit">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Filters</h3>
          
          <div className="space-y-6">
            {/* Date Window */}
            <div>
              <Label>Date Window</Label>
              <Select value={dateWindow} onValueChange={setDateWindow}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="locals">Locals</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="regionals">Regionals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Playstyle Slider */}
            <div>
              <Label>Your Playstyle: {getPlaystyleLabel(playstyle[0])}</Label>
              <div className="mt-4">
                <Slider
                  value={playstyle}
                  onValueChange={setPlaystyle}
                  min={0}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Aggro</span>
                  <span>Midrange</span>
                  <span>Control</span>
                </div>
              </div>
            </div>

            {/* Going First/Second */}
            <div>
              <Label>Prefer Going</Label>
              <Select value={goingFirst} onValueChange={setGoingFirst}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="first">First</SelectItem>
                  <SelectItem value="second">Second</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Mode */}
            <div className="flex items-center justify-between">
              <Label>Budget Mode</Label>
              <Switch checked={budgetMode} onCheckedChange={setBudgetMode} />
            </div>

            {/* Meta Weight */}
            <div>
              <Label>Meta Weight</Label>
              <Select value={metaWeight} onValueChange={setMetaWeight}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="counter">Counter-Meta</SelectItem>
                  <SelectItem value="safe">Safe Pick</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">Apply Filters</Button>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border-soft)]">
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              Data: meta.win_rate, meta.pick_rate, matches.went_first
            </p>
          </div>
        </Card>

        {/* Results Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* #1 Recommended */}
            <Card className="p-6 bg-gradient-to-br from-[var(--accent-blue)]/10 to-transparent border-2 border-[var(--accent-blue)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--accent-blue)] bg-[var(--accent-blue)]/20 px-2 py-1 rounded">
                      #1 RECOMMENDED
                    </span>
                  </div>
                  <ColorBadge color={topColor.color} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[var(--text-primary)]">{topColor.win_rate}%</p>
                  <p className="text-xs text-[var(--text-muted)]">Win Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Pick Rate</p>
                  <p className="font-semibold">{topColor.pick_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Consistency</p>
                  <p className="font-semibold">{topColor.consistency}/100</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Bad Matchups</p>
                  <p className="font-semibold">{topColor.bad_matchups_count}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Skill Ceiling</p>
                  <p className="font-semibold">{topColor.skill_ceiling}/10</p>
                </div>
              </div>
              <Button className="w-full">Generate Best Deck</Button>
            </Card>

            {/* #2 & #3 */}
            <div className="space-y-4">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-muted)]">#2</span>
                    <ColorBadge color={secondColor.color} size="md" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{secondColor.win_rate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">Win Rate</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-muted)]">#3</span>
                    <ColorBadge color={thirdColor.color} size="md" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{thirdColor.win_rate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">Win Rate</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[var(--accent-yellow)]" />
                    <span className="text-xs font-bold">WILDCARD</span>
                    <ColorBadge color={wildcardColor.color} size="md" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{wildcardColor.win_rate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">Underrated</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Why This Color Wins */}
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[var(--accent-blue)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Why {topColor.color.charAt(0).toUpperCase() + topColor.color.slice(1)} Wins Now</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--surface-2)] rounded-lg">
                  <div className="mt-0.5 text-[var(--accent-blue)]">
                    {getReasonIcon(reason.type)}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{reason.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Color Comparison Table */}
          <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Color Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Color</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Win Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Pick Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Bad Matchups</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Consistency</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Skill Floor</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Skill Ceiling</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Top Leaders</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedColors.map((color) => (
                    <tr key={color.color} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-3 px-4">
                        <ColorBadge color={color.color} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--state-success)]">{color.win_rate}%</td>
                      <td className="py-3 px-4">{color.pick_rate}%</td>
                      <td className="py-3 px-4">{color.bad_matchups_count}</td>
                      <td className="py-3 px-4">{color.consistency}/100</td>
                      <td className="py-3 px-4">{color.skill_floor}/10</td>
                      <td className="py-3 px-4">{color.skill_ceiling}/10</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {color.top_leaders.slice(0, 2).map((code) => (
                            <span key={code} className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-3)] px-1.5 py-0.5 rounded">
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                Data: meta.win_rate, meta.pick_rate, decks.consistency_score
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
