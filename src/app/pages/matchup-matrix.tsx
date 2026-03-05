import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { HeatmapGrid } from '../components/heatmap';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { withApiBase } from '../data/apiBase';

type MatrixCell = { row: string; col: string; value: number; sampleSize?: number };
type MatrixDeck = {
  deck: string;
  entries: number;
  wins: number;
  top8: number;
  win_rate_estimate: number;
  top8_rate: number;
  avg_placement: number;
};

type MatrixResponse = {
  rows: string[];
  cols: string[];
  cells: MatrixCell[];
  decks: MatrixDeck[];
};

export default function MatchupMatrix() {
  const [timeWindow, setTimeWindow] = useState('30');
  const [format, setFormat] = useState('all');
  const [selectedMatchup, setSelectedMatchup] = useState<{ row: string; col: string } | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatrix = async (windowDays: string, selectedFormat: string) => {
    try {
      setLoading(true);
      setError(null);
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(windowDays || 30));
      const params = new URLSearchParams();
      params.set('limit', '8');
      if (selectedFormat !== 'all') params.set('format', selectedFormat);
      params.set('date_from', dateFrom.toISOString().slice(0, 10));
      const response = await fetch(withApiBase(`/analytics/matchup-matrix?${params.toString()}`));
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Failed to load matchup matrix');
      setMatrixData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matchup matrix');
      setMatrixData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMatrix(timeWindow, format);
  }, [timeWindow, format]);

  const selectedCell = useMemo(() => {
    if (!selectedMatchup || !matrixData) return null;
    return matrixData.cells.find((c) => c.row === selectedMatchup.row && c.col === selectedMatchup.col) || null;
  }, [selectedMatchup, matrixData]);

  const selectedDeckA = useMemo(
    () => matrixData?.decks?.find((d) => d.deck === selectedMatchup?.row) || null,
    [matrixData, selectedMatchup]
  );

  const selectedDeckB = useMemo(
    () => matrixData?.decks?.find((d) => d.deck === selectedMatchup?.col) || null,
    [matrixData, selectedMatchup]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Matchup Matrix</h1>
          <p className="text-[var(--text-secondary)]">Deck vs Deck matchup grid using live API data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="OP13">OP13</SelectItem>
              <SelectItem value="OP14">OP14</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading matchup matrix...</p>}
      {error && <p className="text-sm text-[var(--state-destructive)]">{error}</p>}

      <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-sm text-[var(--text-secondary)]">Win Rate:</span>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-green-500/80" /><span className="text-xs">65%+</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-green-500/50" /><span className="text-xs">55-64%</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-gray-500/30" /><span className="text-xs">45-54%</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-red-500/50" /><span className="text-xs">35-44%</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-red-500/80" /><span className="text-xs">Below 35%</span></div>
        </div>
      </Card>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="mb-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Full Matchup Grid</h3>
          <p className="text-xs text-[var(--text-muted)]">Click any cell for detailed breakdown</p>
        </div>

        <HeatmapGrid
          data={matrixData?.cells || []}
          rows={matrixData?.rows || []}
          cols={matrixData?.cols || []}
          onCellClick={(row, col) => setSelectedMatchup({ row, col })}
        />
      </Card>

      {selectedMatchup && (
        <Sheet open={!!selectedMatchup} onOpenChange={() => setSelectedMatchup(null)}>
          <SheetContent className="bg-[var(--surface-1)] border-l border-[var(--border-default)] sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-[var(--text-primary)]">
                Matchup Breakdown: {selectedMatchup.row} vs {selectedMatchup.col}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="text-center p-6 bg-[var(--surface-2)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)] mb-2">Estimated Win Rate</p>
                <p className="text-4xl font-bold text-[var(--text-primary)]">{selectedCell?.value ?? 50}%</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Based on {selectedCell?.sampleSize ?? 0} weighted samples</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[var(--state-success)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Win Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedDeckA && selectedDeckB
                    ? `${selectedDeckA.deck} ko edge tab milti hai jab early pressure maintain rahe aur avg placement advantage hold ho.`
                    : 'Deck A gets edge with efficient pressure and cleaner turn curve.'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--state-danger)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Loss Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedDeckA && selectedDeckB
                    ? `Agar ${selectedDeckB.deck} lambi game force kare to matchup swing ho sakta hai.`
                    : 'If opponent drags game and stabilizes board, advantage can flip.'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Deck Stats Snapshot</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[var(--surface-3)] rounded">
                    <span className="text-sm">Deck A Win Rate</span>
                    <span className="text-xs text-[var(--state-success)]">{selectedDeckA?.win_rate_estimate ?? 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[var(--surface-3)] rounded">
                    <span className="text-sm">Deck B Win Rate</span>
                    <span className="text-xs text-[var(--state-success)]">{selectedDeckB?.win_rate_estimate ?? 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[var(--surface-3)] rounded">
                    <span className="text-sm">Top8 Delta</span>
                    <span className="text-xs text-[var(--state-success)]">
                      {((selectedDeckA?.top8_rate ?? 0) - (selectedDeckB?.top8_rate ?? 0)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
