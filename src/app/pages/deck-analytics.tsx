import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Share2, Download, ArrowLeft } from 'lucide-react';

type DeckSummary = {
  entries: number;
  wins: number;
  top8: number;
  win_rate_estimate: number;
  top8_rate: number;
  avg_placement: number | null;
  tournaments_covered: number;
};

type FormatBreakdown = {
  format: string;
  entries: number;
  wins: number;
  top8: number;
  top8_rate: number;
  win_rate_estimate: number;
  avg_placement: number | null;
};

type TopPlayer = {
  player: string;
  entries: number;
  wins: number;
  best_placement: number | null;
};

type RecentResult = {
  tournament: string | null;
  date: string | null;
  format: string | null;
  region: string | null;
  country: string | null;
  players: number | null;
  player: string | null;
  placement: number | null;
  link: string | null;
};

type DeckDetailsResponse = {
  deck: string;
  summary: DeckSummary;
  format_breakdown: FormatBreakdown[];
  top_players: TopPlayer[];
  recent_results: RecentResult[];
  generated_at: string;
};

export default function DeckAnalytics() {
  const { deckId } = useParams();
  const deckName = useMemo(() => decodeURIComponent(deckId || ''), [deckId]);

  const [data, setData] = useState<DeckDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      if (!deckName) {
        if (active) {
          setError('Missing deck name');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/meta/deck/${encodeURIComponent(deckName)}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to load deck analytics');
        }
        if (active) {
          setData(payload);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load deck analytics');
          setData(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchDetails();

    return () => {
      active = false;
    };
  }, [deckName]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{deckName || 'Deck Analytics'}</h1>
          <p className="text-[var(--text-secondary)]">Tournament performance breakdown from standings data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading deck analytics...</p>}
      {error && <p className="text-sm text-[var(--state-destructive)]">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Estimated Win Rate</p>
              <p className="text-2xl font-bold text-[var(--state-success)]">{data.summary.win_rate_estimate.toFixed(1)}%</p>
            </Card>
            <Card className="p-5 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Top 8 Rate</p>
              <p className="text-2xl font-bold">{data.summary.top8_rate.toFixed(1)}%</p>
            </Card>
            <Card className="p-5 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Avg Placement</p>
              <p className="text-2xl font-bold">{data.summary.avg_placement ?? 'N/A'}</p>
            </Card>
            <Card className="p-5 bg-[var(--surface-1)] border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Entries / Wins</p>
              <p className="text-2xl font-bold">{data.summary.entries} / {data.summary.wins}</p>
            </Card>
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList>
              <TabsTrigger value="recent">Recent Results</TabsTrigger>
              <TabsTrigger value="formats">By Format</TabsTrigger>
              <TabsTrigger value="players">Top Players</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-left">
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Tournament</th>
                      <th className="py-2 px-2">Format</th>
                      <th className="py-2 px-2">Player</th>
                      <th className="py-2 px-2">Placement</th>
                      <th className="py-2 px-2">Players</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_results.map((row, idx) => (
                      <tr key={`${row.tournament}-${idx}`} className="border-b border-[var(--border-soft)]">
                        <td className="py-2 px-2">{row.date || '-'}</td>
                        <td className="py-2 px-2">
                          {row.link ? (
                            <a className="text-[var(--accent-blue)] hover:underline" href={row.link} target="_blank" rel="noreferrer">
                              {row.tournament || '-'}
                            </a>
                          ) : (
                            row.tournament || '-'
                          )}
                        </td>
                        <td className="py-2 px-2">{row.format || '-'}</td>
                        <td className="py-2 px-2">{row.player || '-'}</td>
                        <td className="py-2 px-2">{row.placement ?? '-'}</td>
                        <td className="py-2 px-2">{row.players ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="formats" className="mt-6">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-left">
                      <th className="py-2 px-2">Format</th>
                      <th className="py-2 px-2">Entries</th>
                      <th className="py-2 px-2">Wins</th>
                      <th className="py-2 px-2">Top8</th>
                      <th className="py-2 px-2">Win Rate</th>
                      <th className="py-2 px-2">Top8 Rate</th>
                      <th className="py-2 px-2">Avg Placement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.format_breakdown.map((row) => (
                      <tr key={row.format} className="border-b border-[var(--border-soft)]">
                        <td className="py-2 px-2">{row.format}</td>
                        <td className="py-2 px-2">{row.entries}</td>
                        <td className="py-2 px-2">{row.wins}</td>
                        <td className="py-2 px-2">{row.top8}</td>
                        <td className="py-2 px-2">{row.win_rate_estimate.toFixed(1)}%</td>
                        <td className="py-2 px-2">{row.top8_rate.toFixed(1)}%</td>
                        <td className="py-2 px-2">{row.avg_placement ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)] overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-left">
                      <th className="py-2 px-2">Player</th>
                      <th className="py-2 px-2">Entries</th>
                      <th className="py-2 px-2">Wins</th>
                      <th className="py-2 px-2">Best Placement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_players.map((row) => (
                      <tr key={row.player} className="border-b border-[var(--border-soft)]">
                        <td className="py-2 px-2">{row.player}</td>
                        <td className="py-2 px-2">{row.entries}</td>
                        <td className="py-2 px-2">{row.wins}</td>
                        <td className="py-2 px-2">{row.best_placement ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
