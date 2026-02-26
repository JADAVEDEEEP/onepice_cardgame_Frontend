import { cn } from './ui/utils';
import React from 'react';

interface HeatmapCellProps {
  winRate: number;
  label?: string;
  onClick?: () => void;
  sampleSize?: number;
}

export function HeatmapCell({ winRate, label, onClick, sampleSize }: HeatmapCellProps) {
  // Color based on win rate
  const getColorClass = (rate: number) => {
    if (rate >= 65) return 'bg-green-500/80 text-white';
    if (rate >= 55) return 'bg-green-500/50 text-white';
    if (rate >= 50) return 'bg-gray-500/30 text-[var(--text-primary)]';
    if (rate >= 45) return 'bg-red-500/50 text-white';
    return 'bg-red-500/80 text-white';
  };

  const confidenceClass = sampleSize && sampleSize < 10 ? 'opacity-60' : '';

  return (
    <div
      className={cn(
        'relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
        getColorClass(winRate),
        confidenceClass
      )}
      onClick={onClick}
    >
      <span className="text-sm font-semibold">{winRate.toFixed(0)}%</span>
      {label && <span className="text-[10px] opacity-80 mt-0.5">{label}</span>}
      {sampleSize && sampleSize < 10 && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Low sample size" />
      )}
    </div>
  );
}

interface HeatmapGridProps {
  data: { row: string; col: string; value: number; sampleSize?: number }[];
  rows: string[];
  cols: string[];
  onCellClick?: (row: string, col: string) => void;
}

export function HeatmapGrid({ data, rows, cols, onCellClick }: HeatmapGridProps) {
  const getValue = (row: string, col: string) => {
    const cell = data.find(d => d.row === row && d.col === col);
    return cell || { value: 50, sampleSize: 0 };
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1 min-w-full" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(60px, 1fr))` }}>
        {/* Header row */}
        <div className="sticky left-0 z-10 bg-[var(--surface-1)]"></div>
        {cols.map(col => (
          <div key={col} className="text-xs font-medium text-[var(--text-secondary)] text-center p-2 truncate">
            {col}
          </div>
        ))}
        
        {/* Data rows */}
        {rows.flatMap(row => [
          <div key={`label-${row}`} className="sticky left-0 z-10 bg-[var(--surface-1)] text-xs font-medium text-[var(--text-secondary)] flex items-center p-2 truncate">
            {row}
          </div>,
          ...cols.map(col => {
            const cellData = getValue(row, col);
            return (
              <HeatmapCell
                key={`${row}-${col}`}
                winRate={cellData.value}
                sampleSize={cellData.sampleSize}
                onClick={() => onCellClick?.(row, col)}
              />
            );
          })
        ])}
      </div>
    </div>
  );
}