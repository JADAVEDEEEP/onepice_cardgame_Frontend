import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ColorBadge } from '../components/color-badge';
import { Sparkles, Download, Copy, RefreshCw, GitCompare, Save, TrendingUp, Shield, Zap, Target, AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { HeatmapCell } from '../components/heatmap';
import { withApiBase } from '../data/apiBase';

type OPTCGColor = 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';
type Playstyle = 'aggressive' | 'balanced' | 'control';
type MetaContext = 'balanced' | 'removal-heavy' | 'fast-aggro' | 'control-heavy' | 'custom';
type RiskMode = 'consistency' | 'explosiveness';

interface GeneratedDeckCard {
  count: number;
  name: string;
  code: string;
  role: string;
  cost: number;
  power: number;
  counter: number;
}

interface GeneratedDeckResponse {
  leader: { name: string; code: string; image_url?: string } | null;
  tags: string[];
  optimizationScore: number;
  analytics: {
    consistency: number;
    tempo: number;
    control: number;
    lateGame: number;
    brickRisk: number;
    counterDensity: number;
  };
  deckCards: GeneratedDeckCard[];
  insights: string[];
  curve: Array<{ cost: number | string; count: number }>;
  matchupPreview: Array<{ leader: string; winRate: number }>;
}

const colorOptions: { color: OPTCGColor; label: string }[] = [
  { color: 'red', label: 'Red' },
  { color: 'blue', label: 'Blue' },
  { color: 'green', label: 'Green' },
  { color: 'purple', label: 'Purple' },
  { color: 'black', label: 'Black' },
  { color: 'yellow', label: 'Yellow' },
];

const leaders = [
  'Any Leader',
  'Monkey D. Luffy',
  'Kaido',
  'Charlotte Katakuri',
  'Eustass Kid',
  'Donquixote Doflamingo',
  'Boa Hancock',
];

export default function GenerateDeck() {
  const [selectedColor, setSelectedColor] = useState<OPTCGColor | null>(null);
  const [selectedLeader, setSelectedLeader] = useState('Any Leader');
  const [playstyle, setPlaystyle] = useState<Playstyle>('balanced');
  const [metaContext, setMetaContext] = useState<MetaContext>('balanced');
  const [riskMode, setRiskMode] = useState<RiskMode>('consistency');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedDeckResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const color = (params.get('color') || '').toLowerCase() as OPTCGColor;
    if (colorOptions.some((option) => option.color === color)) {
      setSelectedColor(color);
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedColor) return;
    try {
      setIsGenerating(true);
      setError(null);
      const response = await fetch(withApiBase('/analytics/generate-best-deck'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: selectedColor,
          leader: selectedLeader === 'Any Leader' ? '' : selectedLeader,
          playstyle,
          metaContext,
          riskMode,
          deckSize: 50,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to generate best deck');
      }
      setGenerated(payload);
    } catch (err) {
      setGenerated(null);
      setError(err instanceof Error ? err.message : 'Failed to generate best deck');
    } finally {
      setIsGenerating(false);
    }
  };

  const playstyleValue = playstyle === 'aggressive' ? 0 : playstyle === 'balanced' ? 50 : 100;
  const deckSize = useMemo(
    () => generated?.deckCards?.reduce((sum, card) => sum + card.count, 0) || 0,
    [generated?.deckCards]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Generate Best Deck</h1>
        <p className="text-[var(--text-secondary)]">Build an optimized competitive deck instantly using live analytics API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6 h-fit">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Deck Generation Controls</h2>
            <p className="text-sm text-[var(--text-secondary)]">Configure your ideal deck parameters</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Select Color *</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-3">
              {colorOptions.map(({ color, label }) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all duration-200',
                    'flex flex-col items-center gap-2',
                    'hover:scale-105 hover:shadow-lg',
                    selectedColor === color
                      ? `border-[var(--color-${color})] bg-[var(--color-${color})]/10 shadow-[0_0_20px_var(--color-${color})/30]`
                      : 'border-[var(--border-default)] hover:border-[var(--border-soft)]'
                  )}
                >
                  <ColorBadge color={color} size="lg" />
                  <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
                  {selectedColor === color && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--state-success)]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Preferred Leader (Optional)</label>
            <select
              value={selectedLeader}
              onChange={(e) => setSelectedLeader(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--ring)]"
            >
              {leaders.map((leader) => (
                <option key={leader} value={leader}>
                  {leader}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Playstyle Bias</label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={playstyleValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPlaystyle(val < 33 ? 'aggressive' : val < 67 ? 'balanced' : 'control');
                }}
                className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span className={playstyle === 'aggressive' ? 'text-[var(--color-red)] font-semibold' : ''}>Aggressive</span>
                <span className={playstyle === 'balanced' ? 'text-[var(--color-blue)] font-semibold' : ''}>Balanced</span>
                <span className={playstyle === 'control' ? 'text-[var(--color-purple)] font-semibold' : ''}>Control</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Meta Context</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'balanced', label: 'Balanced Meta' },
                { value: 'removal-heavy', label: 'Removal Heavy' },
                { value: 'fast-aggro', label: 'Fast Aggro' },
                { value: 'control-heavy', label: 'Control Heavy' },
                { value: 'custom', label: 'Custom' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setMetaContext(value as MetaContext)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    metaContext === value
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Deck Philosophy</label>
            <div className="flex items-center gap-3 p-3 bg-[var(--surface-2)] rounded-lg">
              <button
                onClick={() => setRiskMode('consistency')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                  riskMode === 'consistency'
                    ? 'bg-[var(--color-blue)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                )}
              >
                <Shield className="inline w-4 h-4 mr-1" />
                High Consistency
              </button>
              <button
                onClick={() => setRiskMode('explosiveness')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                  riskMode === 'explosiveness'
                    ? 'bg-[var(--color-red)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                )}
              >
                <Zap className="inline w-4 h-4 mr-1" />
                High Explosiveness
              </button>
            </div>
          </div>

          <Button
            onClick={() => void handleGenerate()}
            disabled={!selectedColor || isGenerating}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:shadow-lg hover:shadow-[var(--primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Optimal Deck
              </>
            )}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </Card>

        <div className="space-y-6">
          {!generated ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-full min-h-[600px] border-2 border-dashed border-[var(--border-default)]">
              <Sparkles className="w-16 h-16 text-[var(--text-muted)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Ready to Generate</h3>
              <p className="text-[var(--text-secondary)] max-w-md">
                Select your parameters and click "Generate Optimal Deck" to fetch the best deck from your API.
              </p>
            </Card>
          ) : (
            <>
              <Card className="p-6 space-y-4 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] border-[var(--color-red)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      Optimized {(selectedColor || 'red').charAt(0).toUpperCase() + (selectedColor || 'red').slice(1)} Deck
                    </h2>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-2)] rounded-lg">
                        <div className="w-10 h-10 bg-[var(--surface-3)] rounded-md flex items-center justify-center text-xs text-[var(--text-muted)]">
                          {generated.leader?.image_url ? 'IMG' : 'LDR'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{generated.leader?.name || 'Leader not found'}</div>
                          <div className="text-xs text-[var(--text-muted)] font-mono">{generated.leader?.code || '-'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedColor && <ColorBadge color={selectedColor} size="sm" />}
                      {(generated.tags || []).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-[var(--color-blue)]/20 text-[var(--color-blue)] text-xs font-medium rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--state-success)]">{generated.optimizationScore}/100</div>
                    <div className="text-xs text-[var(--text-secondary)]">Optimization Score</div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Consistency', value: generated.analytics.consistency, icon: Shield, color: 'blue' },
                  { label: 'Tempo', value: generated.analytics.tempo, icon: TrendingUp, color: 'green' },
                  { label: 'Control', value: generated.analytics.control, icon: Target, color: 'purple' },
                  { label: 'Late Game', value: generated.analytics.lateGame, icon: BarChart3, color: 'yellow' },
                  { label: 'Brick Risk', value: generated.analytics.brickRisk, icon: AlertCircle, color: 'red', invert: true },
                  { label: 'Counter Density', value: generated.analytics.counterDensity, icon: Shield, color: 'blue' },
                ].map(({ label, value, icon: Icon, color, invert }) => (
                  <Card key={label} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-[var(--color-${color})]`} />
                      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}{invert ? '%' : '/100'}</div>
                    <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-blue)] rounded-full transition-all" style={{ width: `${invert ? 100 - value : value}%` }} />
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Deck Composition ({deckSize} Cards)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-default)]">
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Qty</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Card</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Code</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Role</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Cost</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Power</th>
                        <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Counter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generated.deckCards.map((card) => (
                        <tr key={card.code} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)] transition-colors">
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--surface-2)] text-xs font-semibold">{card.count}</span>
                          </td>
                          <td className="py-2 px-2 font-medium text-[var(--text-primary)]">{card.name}</td>
                          <td className="py-2 px-2"><code className="text-xs text-[var(--text-muted)] font-mono">{card.code}</code></td>
                          <td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-2)]">{card.role}</span></td>
                          <td className="py-2 px-2">{card.cost}</td>
                          <td className="py-2 px-2">{card.power}</td>
                          <td className="py-2 px-2">{card.counter > 0 ? `+${card.counter}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-[var(--surface-1)] to-[var(--color-blue)]/5 border border-[var(--color-blue)]/30">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-blue)]" />
                  Optimization Insights
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  {generated.insights.map((insight) => (
                    <li key={insight} className="flex items-start gap-2">
                      <span className="text-[var(--state-success)] mt-0.5">-</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Mana Curve Distribution</h3>
                <div className="flex items-end justify-between gap-2 h-40">
                  {generated.curve.map((item) => (
                    <div key={String(item.cost)} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-[var(--color-blue)]/30 rounded-t relative"
                        style={{ height: `${Math.max(5, (item.count / Math.max(1, ...generated.curve.map((c) => c.count))) * 100)}%` }}
                      />
                      <span className="text-xs text-[var(--text-secondary)] font-medium">{item.cost}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Matchup Preview</h3>
                <div className="space-y-2">
                  {generated.matchupPreview.map((row) => (
                    <div key={row.leader} className="flex items-center gap-3">
                      <span className="text-sm text-[var(--text-secondary)] w-40">{row.leader}</span>
                      <div className="flex-1">
                        <HeatmapCell winRate={row.winRate} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-wrap gap-3">
                <Button className="flex-1 min-w-[150px]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Deck
                </Button>
                <Button variant="outline" className="flex-1 min-w-[150px]">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="flex-1 min-w-[150px]">
                  <Copy className="w-4 h-4 mr-2" />
                  Clone to Builder
                </Button>
                <Button variant="outline" className="flex-1 min-w-[150px]">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare
                </Button>
                <Button variant="outline" className="flex-1 min-w-[150px]" onClick={() => void handleGenerate()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-Generate
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
