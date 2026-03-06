import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { HeatmapGrid } from '../components/heatmap';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { withApiBase } from '../data/apiBase';
import { Button } from '../components/ui/button';

type MatrixCell = { row: string; col: string; value: number; sampleSize?: number };
type MatrixDeck = {
  deck: string;
  entries: number;
  wins: number;
  top8: number;
  win_rate_estimate: number;
  top8_rate: number;
  avg_placement: number;
  is_custom?: boolean;
  saved_deck_id?: string;
};

type MatrixResponse = {
  rows: string[];
  cols: string[];
  cells: MatrixCell[];
  decks: MatrixDeck[];
  pagination?: {
    total_decks: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export default function MatchupMatrix() {
  const [timeWindow, setTimeWindow] = useState('30');
  const [format, setFormat] = useState('all');
  const [deckQuery, setDeckQuery] = useState('');
  const [page, setPage] = useState(1);
  const [savedDeckId] = useState(() => new URLSearchParams(window.location.search).get('savedDeck') || '');
  const [selectedMatchup, setSelectedMatchup] = useState<{ row: string; col: string } | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatrix = async (windowDays: string, selectedFormat: string, savedId: string, currentPage: number, currentQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(windowDays || 30));
      const params = new URLSearchParams();
      params.set('limit', '8');
      params.set('page', String(currentPage));
      if (selectedFormat !== 'all') params.set('format', selectedFormat);
      params.set('date_from', dateFrom.toISOString().slice(0, 10));
      if (savedId) params.set('saved_deck_id', savedId);
      if (currentQuery.trim()) params.set('deck_query', currentQuery.trim());
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
    void loadMatrix(timeWindow, format, savedDeckId, page, deckQuery);
  }, [timeWindow, format, savedDeckId, page, deckQuery]);

  useEffect(() => {
    setPage(1);
  }, [timeWindow, format, deckQuery]);

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

  const top8Delta = (selectedDeckA?.top8_rate ?? 0) - (selectedDeckB?.top8_rate ?? 0);
  const avgPlacementDelta = (selectedDeckB?.avg_placement ?? 20) - (selectedDeckA?.avg_placement ?? 20);
  const matrixWinRate = selectedCell?.value ?? 50;
  const sampleSize = selectedCell?.sampleSize ?? 0;
  const confidence = sampleSize >= 25 ? 'high' : sampleSize >= 12 ? 'medium' : 'low';

  const dynamicWinCondition = useMemo(() => {
    if (!selectedDeckA || !selectedDeckB) return 'Deck A ko edge tab milti hai jab opening tempo clean rahe.';
    if (matrixWinRate >= 60 && top8Delta >= 0) {
      return `${selectedDeckA.deck} ko strong edge milti hai jab early board presence banaye rakhe aur ${selectedDeckB.deck} ko react karne par majboor kare.`;
    }
    if (matrixWinRate >= 55) {
      return `${selectedDeckA.deck} stable line tab banata hai jab mid turns me pressure + value dono maintain kiye jaye.`;
    }
    return `${selectedDeckA.deck} ko win lane ke liye disciplined curve aur key turns par efficient trades chahiye.`;
  }, [selectedDeckA, selectedDeckB, matrixWinRate, top8Delta]);

  const dynamicLossCondition = useMemo(() => {
    if (!selectedDeckA || !selectedDeckB) return 'Agar opponent game drag kare to matchup flip ho sakta hai.';
    if (matrixWinRate <= 45) {
      return `${selectedDeckB.deck} ka control tempo ${selectedDeckA.deck} ko late turns me out-value kar sakta hai, especially jab early pressure fail ho.`;
    }
    if (avgPlacementDelta < 0) {
      return `Agar ${selectedDeckA.deck} key turns miss kare to ${selectedDeckB.deck} placement-consistency advantage ke through game lock kar sakta hai.`;
    }
    return `Agar ${selectedDeckB.deck} lambi game force kare aur removal exchanges better kare to edge swing ho sakti hai.`;
  }, [selectedDeckA, selectedDeckB, matrixWinRate, avgPlacementDelta]);

  const dynamicPlayPatterns = useMemo(() => {
    if (!selectedDeckA || !selectedDeckB) return [];
    const list = [];
    if (matrixWinRate >= 55) list.push('Mulligan me proactive starts prioritize karo taaki opening pressure lose na ho.');
    else list.push('Mulligan me defensive + stable hand rakho aur high-risk starts avoid karo.');

    if (top8Delta >= 0) list.push(`Mid game me ${selectedDeckA.deck} ka proven line follow karo: low-variance sequencing pe focus rakho.`);
    else list.push(`Mid game me ${selectedDeckB.deck} ke power spike turns ko respect karo aur resources conserve karo.`);

    if (avgPlacementDelta >= 0) list.push('Closing turns me tempo convert karke game jaldi finish karo, extra grind avoid karo.');
    else list.push('Game ko long kheechne se pehle value parity ensure karo, warna late swing ka risk badhega.');

    list.push(`Confidence ${confidence} hai, isliye ${confidence === 'low' ? 'matchup ko testing ke saath pilot karo.' : 'current line ko tournament prep me use kar sakte ho.'}`);
    return list;
  }, [selectedDeckA, selectedDeckB, matrixWinRate, top8Delta, avgPlacementDelta, confidence]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Matchup Matrix</h1>
          <p className="text-[var(--text-secondary)]">Deck vs Deck matchup grid using live API data</p>
          {savedDeckId && <p className="text-xs text-[var(--text-muted)] mt-1">Including your saved deck in matrix calculation.</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={deckQuery}
            onChange={(e) => setDeckQuery(e.target.value)}
            placeholder="Search deck..."
            className="h-10 w-[180px] rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] px-3 text-sm"
          />
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
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Page {matrixData?.pagination?.total_pages ? Math.min(page, matrixData.pagination.total_pages) : page}
            {matrixData?.pagination?.total_pages ? ` / ${matrixData.pagination.total_pages}` : ''}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!matrixData?.pagination?.has_prev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!matrixData?.pagination?.has_next || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
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
                <p className="text-xs text-[var(--text-muted)] mt-1">Confidence: {confidence}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[var(--state-success)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Win Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{dynamicWinCondition}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--state-danger)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Loss Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{dynamicLossCondition}</p>
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

              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">Best Play Patterns</h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  {dynamicPlayPatterns.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-[var(--accent-blue)]">-</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
