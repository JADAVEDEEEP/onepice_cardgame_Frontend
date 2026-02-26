import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { HeatmapGrid } from '../components/heatmap';
import { mockMetaData, colorMatchups } from '../data/mockData';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MatchupMatrix() {
  const [timeWindow, setTimeWindow] = useState('30');
  const [format, setFormat] = useState('all');
  const [selectedMatchup, setSelectedMatchup] = useState<{ row: string; col: string } | null>(null);

  const leaderNames = mockMetaData.slice(0, 6).map(d => d.leader_name.split(' ').pop() || d.leader_name);
  
  const heatmapData = leaderNames.flatMap(row => 
    leaderNames.map(col => {
      const baseValue = row === col ? 50 : Math.random() * 30 + 40;
      return {
        row,
        col,
        value: Math.round(baseValue),
        sampleSize: Math.floor(Math.random() * 50) + 10
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Matchup Matrix</h1>
          <p className="text-[var(--text-secondary)]">Complete win rate analysis across all matchups</p>
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
              <SelectItem value="locals">Locals</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="regionals">Regionals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-sm text-[var(--text-secondary)]">Win Rate:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500/80" />
            <span className="text-xs">65%+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500/50" />
            <span className="text-xs">55-64%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-500/30" />
            <span className="text-xs">45-54%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500/50" />
            <span className="text-xs">35-44%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500/80" />
            <span className="text-xs">Below 35%</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-[var(--text-muted)]">Low sample size</span>
          </div>
        </div>
      </Card>

      {/* Heatmap */}
      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="mb-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Full Matchup Grid</h3>
          <p className="text-xs text-[var(--text-muted)]">Click any cell for detailed breakdown</p>
        </div>
        
        <HeatmapGrid
          data={heatmapData}
          rows={leaderNames}
          cols={leaderNames}
          onCellClick={(row, col) => setSelectedMatchup({ row, col })}
        />

        <div className="mt-4 pt-4 border-t border-[var(--border-soft)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            Data: matches.result, decks.leader_code, matches.format
          </p>
        </div>
      </Card>

      {/* Matchup Breakdown Sheet */}
      {selectedMatchup && (
        <Sheet open={!!selectedMatchup} onOpenChange={() => setSelectedMatchup(null)}>
          <SheetContent className="bg-[var(--surface-1)] border-l border-[var(--border-default)] sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-[var(--text-primary)]">
                Matchup Breakdown: {selectedMatchup.row} vs {selectedMatchup.col}
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Win Rate */}
              <div className="text-center p-6 bg-[var(--surface-2)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)] mb-2">Win Rate</p>
                <p className="text-4xl font-bold text-[var(--text-primary)]">55%</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Based on 42 matches</p>
              </div>

              {/* Common Win Condition */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[var(--state-success)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Win Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Aggressive early game pressure with cost-efficient characters. Typical win by turn 7-8 before opponent stabilizes.
                </p>
              </div>

              {/* Common Loss Condition */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--state-danger)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Common Loss Condition</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Opponent's removal density overwhelms board presence. Runs out of gas by turn 5-6.
                </p>
              </div>

              {/* Recommended Tech Cards */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Recommended Tech Cards</h4>
                </div>
                <div className="space-y-2">
                  {['OP01-047', 'OP02-036', 'OP01-031'].map((code) => (
                    <div key={code} className="flex items-center justify-between p-2 bg-[var(--surface-3)] rounded">
                      <span className="text-sm font-mono">{code}</span>
                      <span className="text-xs text-[var(--state-success)]">+3.2% WR</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Play Pattern Tips */}
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">Best Play Patterns</h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-blue)]">•</span>
                    Mulligan aggressively for 2-3 cost characters
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-blue)]">•</span>
                    Prioritize going first in this matchup
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-blue)]">•</span>
                    Save removal for key threats (6+ cost)
                  </li>
                </ul>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
