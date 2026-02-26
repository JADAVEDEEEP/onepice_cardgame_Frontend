import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ColorBadge } from '../components/color-badge';
import { Sparkles, Download, Copy, RefreshCw, GitCompare, Save, TrendingUp, Shield, Zap, Target, AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { HeatmapCell } from '../components/heatmap';

type OPTCGColor = 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';
type Playstyle = 'aggressive' | 'balanced' | 'control';
type MetaContext = 'balanced' | 'removal-heavy' | 'fast-aggro' | 'control-heavy' | 'custom';
type RiskMode = 'consistency' | 'explosiveness';

interface DeckCard {
  count: number;
  name: string;
  code: string;
  role: 'Removal' | 'Engine' | 'Finisher' | 'Blocker' | 'Draw' | 'Tech';
  cost: number;
  power: number;
  counter: number;
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
  'Monkey D. Luffy (OP01-016)',
  'Kaido (OP01-024)',
  'Charlotte Katakuri (OP03-099)',
  'Eustass Kid (OP01-051)',
  'Donquixote Doflamingo (OP04-031)',
  'Boa Hancock (OP01-078)',
];

const mockDeckCards: DeckCard[] = [
  { count: 4, name: 'Monkey D. Luffy', code: 'OP01-003', role: 'Engine', cost: 5, power: 6000, counter: 1000 },
  { count: 4, name: 'Roronoa Zoro', code: 'OP01-025', role: 'Removal', cost: 4, power: 5000, counter: 1000 },
  { count: 4, name: 'Nami', code: 'OP01-016', role: 'Draw', cost: 1, power: 1000, counter: 1000 },
  { count: 3, name: 'Nico Robin', code: 'OP01-017', role: 'Blocker', cost: 3, power: 4000, counter: 2000 },
  { count: 4, name: 'Gum-Gum Red Roc', code: 'OP01-035', role: 'Finisher', cost: 7, power: 0, counter: 0 },
  { count: 3, name: 'Izo', code: 'OP01-033', role: 'Removal', cost: 3, power: 4000, counter: 1000 },
  { count: 4, name: 'Sanji', code: 'OP01-013', role: 'Engine', cost: 4, power: 5000, counter: 0 },
  { count: 2, name: 'Tony Tony Chopper', code: 'OP01-006', role: 'Tech', cost: 1, power: 2000, counter: 1000 },
  { count: 4, name: 'Radical Beam', code: 'OP01-029', role: 'Removal', cost: 2, power: 0, counter: 0 },
  { count: 3, name: 'Going Merry', code: 'OP01-015', role: 'Draw', cost: 1, power: 0, counter: 0 },
  { count: 2, name: 'Jewelry Bonney', code: 'OP01-026', role: 'Tech', cost: 2, power: 3000, counter: 1000 },
  { count: 4, name: 'Trafalgar Law', code: 'OP01-047', role: 'Blocker', cost: 5, power: 6000, counter: 1000 },
  { count: 3, name: 'Koala', code: 'OP01-006', role: 'Draw', cost: 2, power: 3000, counter: 2000 },
  { count: 2, name: 'Shanks', code: 'OP01-025', role: 'Finisher', cost: 9, power: 9000, counter: 0 },
  { count: 4, name: 'Whitebeard Pirates', code: 'OP01-031', role: 'Engine', cost: 3, power: 4000, counter: 0 },
];

export default function GenerateDeck() {
  const [selectedColor, setSelectedColor] = useState<OPTCGColor | null>(null);
  const [selectedLeader, setSelectedLeader] = useState('Any Leader');
  const [playstyle, setPlaystyle] = useState<Playstyle>('balanced');
  const [metaContext, setMetaContext] = useState<MetaContext>('balanced');
  const [riskMode, setRiskMode] = useState<RiskMode>('consistency');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1500);
  };

  const playstyleValue = playstyle === 'aggressive' ? 0 : playstyle === 'balanced' ? 50 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Generate Best Deck</h1>
        <p className="text-[var(--text-secondary)]">Build an optimized competitive deck instantly using AI-powered analytics</p>
      </div>

      {/* Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL - Controls */}
        <Card className="p-6 space-y-6 h-fit">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Deck Generation Controls</h2>
            <p className="text-sm text-[var(--text-secondary)]">Configure your ideal deck parameters</p>
          </div>

          {/* 1. Color Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Select Color *
            </label>
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
                  {selectedColor === color && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--state-success)]" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: cards.color</p>
          </div>

          {/* 2. Leader Preference */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Preferred Leader (Optional)
            </label>
            <select
              value={selectedLeader}
              onChange={(e) => setSelectedLeader(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--ring)]"
            >
              {leaders.map((leader) => (
                <option key={leader} value={leader}>{leader}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)]">Leave as "Any" for mathematically best deck</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: leaders.leader_code</p>
          </div>

          {/* 3. Playstyle Bias Slider */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Playstyle Bias
            </label>
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
                <span className={playstyle === 'aggressive' ? 'text-[var(--color-red)] font-semibold' : ''}>
                  Aggressive
                </span>
                <span className={playstyle === 'balanced' ? 'text-[var(--color-blue)] font-semibold' : ''}>
                  Balanced
                </span>
                <span className={playstyle === 'control' ? 'text-[var(--color-purple)] font-semibold' : ''}>
                  Control
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Adjust deck behavior and tempo</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: deck_optimizer.playstyle</p>
          </div>

          {/* 4. Meta Context Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Meta Context
            </label>
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
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: meta.context</p>
          </div>

          {/* 5. Risk/Consistency Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Deck Philosophy
            </label>
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
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: deck_optimizer.risk_mode</p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
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
        </Card>

        {/* RIGHT PANEL - Generated Deck Display */}
        <div className="space-y-6">
          {!hasGenerated ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-full min-h-[600px] border-2 border-dashed border-[var(--border-default)]">
              <Sparkles className="w-16 h-16 text-[var(--text-muted)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Ready to Generate</h3>
              <p className="text-[var(--text-secondary)] max-w-md">
                Select your parameters on the left and click "Generate Optimal Deck" to create your perfect competitive deck
              </p>
            </Card>
          ) : (
            <>
              {/* Deck Header */}
              <Card className="p-6 space-y-4 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] border-[var(--color-red)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      Optimized {selectedColor && selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)} Deck
                    </h2>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-2)] rounded-lg">
                        <div className="w-10 h-10 bg-[var(--surface-3)] rounded-md flex items-center justify-center text-xs text-[var(--text-muted)]">
                          IMG
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">Monkey D. Luffy</div>
                          <div className="text-xs text-[var(--text-muted)] font-mono">OP01-016</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedColor && <ColorBadge color={selectedColor} size="sm" />}
                      <span className="px-2 py-1 bg-[var(--color-red)]/20 text-[var(--color-red)] text-xs font-medium rounded">
                        Aggro
                      </span>
                      <span className="px-2 py-1 bg-[var(--color-blue)]/20 text-[var(--color-blue)] text-xs font-medium rounded">
                        Tempo
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--state-success)]">92/100</div>
                    <div className="text-xs text-[var(--text-secondary)]">Optimization Score</div>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">Data: leaders.leader_code, deck_optimizer.score</p>
              </Card>

              {/* Deck Analytics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Consistency', value: 88, icon: Shield, color: 'blue' },
                  { label: 'Tempo', value: 92, icon: TrendingUp, color: 'green' },
                  { label: 'Control', value: 65, icon: Target, color: 'purple' },
                  { label: 'Late Game', value: 78, icon: BarChart3, color: 'yellow' },
                  { label: 'Brick Risk', value: 12, icon: AlertCircle, color: 'red', invert: true },
                  { label: 'Counter Density', value: 85, icon: Shield, color: 'blue' },
                ].map(({ label, value, icon: Icon, color, invert }) => (
                  <Card key={label} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-[var(--color-${color})]`} />
                      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}{invert ? '%' : '/100'}</div>
                    <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-[var(--color-${color})] rounded-full transition-all`}
                        style={{ width: `${invert ? 100 - value : value}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] font-mono mt-2">Data: decks.{label.toLowerCase().replace(' ', '_')}</p>
                  </Card>
                ))}
              </div>

              {/* Deck Composition Table */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Deck Composition (50 Cards)</h3>
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
                      {mockDeckCards.map((card, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--surface-2)] text-xs font-semibold">
                              {card.count}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[var(--surface-3)] rounded flex-shrink-0 flex items-center justify-center text-[9px] text-[var(--text-muted)]">
                                IMG
                              </div>
                              <span className="font-medium text-[var(--text-primary)]">{card.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <code className="text-xs text-[var(--text-muted)] font-mono">{card.code}</code>
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                                card.role === 'Removal' && 'bg-red-500/20 text-red-400',
                                card.role === 'Engine' && 'bg-blue-500/20 text-blue-400',
                                card.role === 'Finisher' && 'bg-purple-500/20 text-purple-400',
                                card.role === 'Blocker' && 'bg-green-500/20 text-green-400',
                                card.role === 'Draw' && 'bg-yellow-500/20 text-yellow-400',
                                card.role === 'Tech' && 'bg-gray-500/20 text-gray-400'
                              )}
                            >
                              {card.role}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--color-blue)]/20 text-[var(--color-blue)] text-xs font-semibold">
                              {card.cost}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-xs font-semibold text-[var(--text-primary)]">{card.power}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-xs font-semibold text-[var(--color-yellow)]">{card.counter > 0 ? `+${card.counter}` : '-'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-4">Data: cards.card_code, cards.cost, cards.power, cards.counter_value</p>
              </Card>

              {/* Why This Deck Works */}
              <Card className="p-6 bg-gradient-to-br from-[var(--surface-1)] to-[var(--color-blue)]/5 border border-[var(--color-blue)]/30">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-blue)]" />
                  Optimization Insights
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">Strong vs current meta:</strong> 68% win rate against top 5 leaders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">Stable curve distribution:</strong> Optimal Don usage across turns 1-10</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">High early pressure:</strong> 28 cards cost 4 or less for tempo advantage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">Efficient Don usage:</strong> Maximizes board presence per turn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">Low brick probability:</strong> Only 8% chance of dead hand</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--state-success)] mt-0.5">✓</span>
                    <span><strong className="text-[var(--text-primary)]">Balanced counter/removal ratio:</strong> 32 counter cards, 11 removal pieces</span>
                  </li>
                </ul>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-4">Data: deck_optimizer.insights</p>
              </Card>

              {/* Curve Visualization */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Mana Curve Distribution</h3>
                <div className="flex items-end justify-between gap-2 h-40">
                  {[
                    { cost: 1, count: 9 },
                    { cost: 2, count: 11 },
                    { cost: 3, count: 12 },
                    { cost: 4, count: 8 },
                    { cost: 5, count: 5 },
                    { cost: 6, count: 2 },
                    { cost: 7, count: 2 },
                    { cost: 8, count: 1 },
                    { cost: '9+', count: 0 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[var(--color-blue)]/30 rounded-t relative group hover:bg-[var(--color-blue)]/50 transition-colors" style={{ height: `${(item.count / 12) * 100}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium">{item.cost}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-4">Data: cards.cost, deck_composition.curve</p>
              </Card>

              {/* Matchup Preview */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Matchup Preview</h3>
                <div className="space-y-2">
                  {[
                    { leader: 'Kaido (Purple)', winRate: 68 },
                    { leader: 'Katakuri (Green)', winRate: 62 },
                    { leader: 'Kid (Red)', winRate: 71 },
                    { leader: 'Doflamingo (Blue)', winRate: 58 },
                    { leader: 'Hancock (Black)', winRate: 65 },
                  ].map(({ leader, winRate }) => (
                    <div key={leader} className="flex items-center gap-3">
                      <span className="text-sm text-[var(--text-secondary)] w-40">{leader}</span>
                      <div className="flex-1">
                        <HeatmapCell winRate={winRate} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-4">Data: matchups.win_rate</p>
              </Card>

              {/* Action Buttons */}
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
                <Button variant="outline" className="flex-1 min-w-[150px]">
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
