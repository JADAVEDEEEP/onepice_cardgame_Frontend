import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ColorBadge } from '../components/color-badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { withApiBase } from '../data/apiBase';

type OPTCGColor = 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';

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
  top_10_ranked_decks: RankedDeck[];
};

type DeckDetailsResponse = {
  deck: string;
  summary: {
    entries: number;
    wins: number;
    top8: number;
    win_rate_estimate: number;
    top8_rate: number;
    avg_placement: number | null;
    tournaments_covered: number;
  };
};

type CompareMetrics = {
  winRate: number;
  consistency: number;
  tempo: number;
  metaFit: number;
  skill: number;
  resilience: number;
};

const colorCycle: OPTCGColor[] = ['red', 'blue', 'green', 'purple', 'black', 'yellow'];

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const calculateMetrics = (summary: DeckDetailsResponse['summary']): CompareMetrics => {
  const winRate = clamp(summary.win_rate_estimate || 0);
  const top8 = clamp(summary.top8_rate || 0);
  const entries = Math.max(0, summary.entries || 0);
  const avgPlacement = summary.avg_placement ?? 20;

  return {
    winRate,
    consistency: clamp(Math.round(top8 * 0.55 + Math.min(entries, 40) * 1.1)),
    tempo: clamp(Math.round(100 - Math.min(90, avgPlacement * 4.2))),
    metaFit: clamp(Math.round(winRate * 0.6 + top8 * 0.4)),
    skill: clamp(Math.round(45 + Math.min(35, Math.log2(entries + 1) * 7))),
    resilience: clamp(Math.round(top8 * 0.65 + winRate * 0.2 + Math.min(20, summary.tournaments_covered * 1.4))),
  };
};

export default function DeckCompare() {
  const [deckOptions, setDeckOptions] = useState<RankedDeck[]>([]);
  const [deckAName, setDeckAName] = useState('');
  const [deckBName, setDeckBName] = useState('');
  const [deckA, setDeckA] = useState<DeckDetailsResponse | null>(null);
  const [deckB, setDeckB] = useState<DeckDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(withApiBase('/meta/best-deck'));
        const payload: BestDeckResponse = await response.json();
        if (!response.ok) {
          throw new Error((payload as { message?: string })?.message || 'Failed to load deck options');
        }
        const options = Array.isArray(payload?.top_10_ranked_decks) ? payload.top_10_ranked_decks : [];
        if (!mounted) return;
        setDeckOptions(options);
        setDeckAName(options[0]?.deck || '');
        setDeckBName(options[1]?.deck || options[0]?.deck || '');
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load deck options');
          setDeckOptions([]);
          setDeckAName('');
          setDeckBName('');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadOptions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDeckDetail = async (deckName: string, setFn: (value: DeckDetailsResponse | null) => void) => {
      if (!deckName) {
        setFn(null);
        return;
      }
      try {
        const response = await fetch(withApiBase(`/meta/deck/${encodeURIComponent(deckName)}`));
        const payload: DeckDetailsResponse = await response.json();
        if (!response.ok) {
          throw new Error((payload as { message?: string })?.message || `Failed to load ${deckName}`);
        }
        if (mounted) setFn(payload);
      } catch {
        if (mounted) setFn(null);
      }
    };

    void loadDeckDetail(deckAName, setDeckA);
    void loadDeckDetail(deckBName, setDeckB);

    return () => {
      mounted = false;
    };
  }, [deckAName, deckBName]);

  const selectedAIndex = Math.max(
    0,
    deckOptions.findIndex((deck) => deck.deck === deckAName)
  );
  const selectedBIndex = Math.max(
    0,
    deckOptions.findIndex((deck) => deck.deck === deckBName)
  );

  const metricsA = deckA ? calculateMetrics(deckA.summary) : null;
  const metricsB = deckB ? calculateMetrics(deckB.summary) : null;

  const radarData = useMemo(() => {
    if (!metricsA || !metricsB) return [];
    return [
      { stat: 'Aggression', deckA: metricsA.tempo, deckB: metricsB.tempo },
      { stat: 'Control', deckA: metricsA.resilience, deckB: metricsB.resilience },
      { stat: 'Consistency', deckA: metricsA.consistency, deckB: metricsB.consistency },
      { stat: 'Tempo', deckA: metricsA.tempo, deckB: metricsB.tempo },
      { stat: 'Resilience', deckA: metricsA.resilience, deckB: metricsB.resilience },
      { stat: 'Skill', deckA: metricsA.skill, deckB: metricsB.skill },
    ];
  }, [metricsA, metricsB]);

  const statsComparison = useMemo(() => {
    if (!metricsA || !metricsB) return [];

    const rows = [
      { metric: 'Win Rate', deckA: `${metricsA.winRate.toFixed(1)}%`, deckB: `${metricsB.winRate.toFixed(1)}%`, valueA: metricsA.winRate, valueB: metricsB.winRate },
      { metric: 'Consistency', deckA: `${metricsA.consistency}/100`, deckB: `${metricsB.consistency}/100`, valueA: metricsA.consistency, valueB: metricsB.consistency },
      { metric: 'Tempo Score', deckA: `${(metricsA.tempo / 10).toFixed(1)}/10`, deckB: `${(metricsB.tempo / 10).toFixed(1)}/10`, valueA: metricsA.tempo, valueB: metricsB.tempo },
      { metric: 'Meta Fit', deckA: `${metricsA.metaFit}/100`, deckB: `${metricsB.metaFit}/100`, valueA: metricsA.metaFit, valueB: metricsB.metaFit },
      { metric: 'Skill Rating', deckA: `${(metricsA.skill / 10).toFixed(1)}/10`, deckB: `${(metricsB.skill / 10).toFixed(1)}/10`, valueA: metricsA.skill, valueB: metricsB.skill },
    ];

    return rows.map((row) => ({
      ...row,
      winner: row.valueA > row.valueB ? 'A' : row.valueB > row.valueA ? 'B' : 'tie',
    }));
  }, [metricsA, metricsB]);

  const aWins = statsComparison.filter((row) => row.winner === 'A').length;
  const bWins = statsComparison.filter((row) => row.winner === 'B').length;

  const recommendationA = useMemo(() => {
    if (!metricsA || !metricsB || !deckA) return [];
    const bullets: string[] = [];
    if (metricsA.winRate > metricsB.winRate) bullets.push(`Higher estimated win rate (${metricsA.winRate.toFixed(1)}%) than ${deckB?.deck || 'Deck B'}.`);
    if (metricsA.consistency > metricsB.consistency) bullets.push(`More stable consistency profile (${metricsA.consistency}/100).`);
    if (metricsA.metaFit > metricsB.metaFit) bullets.push(`Better current meta fit score (${metricsA.metaFit}/100).`);
    if (metricsA.tempo > metricsB.tempo) bullets.push(`Stronger tempo pressure for faster match pace.`);
    if (metricsA.resilience > metricsB.resilience) bullets.push(`Better resilience in long sets and grind games.`);
    if (bullets.length === 0) bullets.push(`${deckA.deck} is a balanced alternative if you prefer its play pattern.`);
    return bullets.slice(0, 4);
  }, [metricsA, metricsB, deckA, deckB]);

  const recommendationB = useMemo(() => {
    if (!metricsA || !metricsB || !deckB) return [];
    const bullets: string[] = [];
    if (metricsB.winRate > metricsA.winRate) bullets.push(`Higher estimated win rate (${metricsB.winRate.toFixed(1)}%) than ${deckA?.deck || 'Deck A'}.`);
    if (metricsB.consistency > metricsA.consistency) bullets.push(`More stable consistency profile (${metricsB.consistency}/100).`);
    if (metricsB.metaFit > metricsA.metaFit) bullets.push(`Better current meta fit score (${metricsB.metaFit}/100).`);
    if (metricsB.tempo > metricsA.tempo) bullets.push(`Stronger tempo pressure for proactive rounds.`);
    if (metricsB.resilience > metricsA.resilience) bullets.push(`Better resilience under long-round pressure.`);
    if (metricsB.skill > metricsA.skill) bullets.push(`Higher skill ceiling for advanced pilot optimization.`);
    if (bullets.length === 0) bullets.push(`${deckB.deck} is a balanced alternative if you prefer its matchup spread.`);
    return bullets.slice(0, 4);
  }, [metricsA, metricsB, deckA, deckB]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Deck Compare</h1>
        <p className="text-[var(--text-secondary)]">Side-by-side analysis using live meta API data</p>
      </div>

      {error && <p className="text-sm text-[var(--state-destructive)]">{error}</p>}
      {loading && <p className="text-sm text-[var(--text-muted)]">Loading deck options...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] mb-2">Deck A</p>
          <Select value={deckAName} onValueChange={setDeckAName}>
            <SelectTrigger>
              <SelectValue placeholder="Select deck A" />
            </SelectTrigger>
            <SelectContent>
              {deckOptions.map((deck) => (
                <SelectItem key={`a-${deck.deck}`} value={deck.deck}>
                  {deck.deck}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex items-center gap-2">
            <ColorBadge color={colorCycle[selectedAIndex % colorCycle.length]} size="sm" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{deckA?.deck || 'N/A'}</span>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] mb-2">Deck B</p>
          <Select value={deckBName} onValueChange={setDeckBName}>
            <SelectTrigger>
              <SelectValue placeholder="Select deck B" />
            </SelectTrigger>
            <SelectContent>
              {deckOptions.map((deck) => (
                <SelectItem key={`b-${deck.deck}`} value={deck.deck}>
                  {deck.deck}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex items-center gap-2">
            <ColorBadge color={colorCycle[selectedBIndex % colorCycle.length]} size="sm" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{deckB?.deck || 'N/A'}</span>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Key Metrics</h3>
        {statsComparison.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Select two decks to compare metrics.</p>
        ) : (
          <div className="space-y-3">
            {statsComparison.map((stat) => (
              <div key={stat.metric} className="flex items-center gap-4">
                <div className="w-32 text-sm text-[var(--text-secondary)]">{stat.metric}</div>
                <div className={`flex-1 text-sm font-semibold ${stat.winner === 'A' ? 'text-[var(--state-success)]' : ''}`}>{stat.deckA}</div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                <div className={`flex-1 text-sm font-semibold text-right ${stat.winner === 'B' ? 'text-[var(--state-success)]' : ''}`}>{stat.deckB}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

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

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recommendation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--state-success)]" />
              <p className="font-semibold text-[var(--text-primary)]">Choose Deck A if...</p>
            </div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {recommendationA.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Metric lead: {aWins} categories</p>
          </div>
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-[var(--accent-purple)]" />
              <p className="font-semibold text-[var(--text-primary)]">Choose Deck B if...</p>
            </div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {recommendationB.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Metric lead: {bWins} categories</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
