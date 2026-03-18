import { Plus, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { ColorBadge } from './color-badge';
import { Card } from '../data/types';

interface CardTileProps {
  card: Card;
  onAdd?: (card: Card) => void;
  onRemove?: (card: Card) => void;
  count?: number;
  synergy?: 'engine' | 'removal' | 'finisher' | 'blocker' | null;
  compact?: boolean;
}

export function CardTile({ card, onAdd, onRemove, count = 0, synergy, compact = false }: CardTileProps) {
  const imageCandidates = useMemo(() => {
    const fallback = 'https://placehold.co/400x560?text=Card';
    const urls = new Set<string>();
    const primary = (card.image_url || '').trim();
    const add = (url?: string) => {
      const value = (url || '').trim();
      if (value) {
        urls.add(value);
      }
    };

    add(primary);
    add(primary.split('?')[0]);

    add(fallback);
    return Array.from(urls);
  }, [card.card_code, card.image_url]);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)];

  const synergyConfig = {
    engine: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Engine' },
    removal: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Removal' },
    finisher: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Finisher' },
    blocker: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Blocker' }
  };

  if (compact) {
    return (
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg p-3 hover:border-[var(--border-soft)] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-16 bg-[var(--surface-3)] rounded overflow-hidden flex-shrink-0">
            <img
              src={currentImage}
              alt={card.name}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageIndex((prev) => Math.min(prev + 1, imageCandidates.length - 1))}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{card.name}</p>
            <p className="text-xs font-mono text-[var(--text-muted)]">{card.card_code}</p>
            <div className="flex items-center gap-2 mt-1">
              <ColorBadge color={card.color} size="sm" showLabel={false} />
              <span className="text-xs text-[var(--text-secondary)]">Cost {card.cost}</span>
            </div>
          </div>
          {(onAdd || onRemove) && (
            <div className="flex items-center gap-1">
              {count > 0 && (
                <>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onRemove?.(card)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{count}</span>
                </>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAdd?.(card)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-14)] overflow-hidden hover:border-[var(--border-soft)] hover:shadow-lg transition-all group">
      {/* Card Image */}
      <div className="relative aspect-[2.5/3.5] bg-[var(--surface-3)]">
        <img
          src={currentImage}
          alt={card.name}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageIndex((prev) => Math.min(prev + 1, imageCandidates.length - 1))}
        />
        {synergy && (
          <div className={cn(
            "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
            synergyConfig[synergy].bg,
            synergyConfig[synergy].text
          )}>
            {synergyConfig[synergy].label}
          </div>
        )}
        {count > 0 && (
          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium">
            x{count}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3">
        <p className="font-medium text-[var(--text-primary)] mb-1 truncate">{card.name}</p>
        <p className="text-xs font-mono text-[var(--text-muted)] mb-2">{card.card_code}</p>
        
        <div className="flex items-center gap-2 mb-2">
          <ColorBadge color={card.color} size="sm" />
          <span className="text-xs px-2 py-0.5 bg-[var(--surface-2)] rounded text-[var(--text-secondary)]">
            {card.type}
          </span>
          {card.tournament_status && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide",
                card.tournament_status === "banned"
                  ? "bg-red-500/20 text-red-400"
                  : card.tournament_status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-[var(--surface-2)] text-[var(--text-muted)]"
              )}
            >
              {card.tournament_status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-3">
          <span>Cost: {card.cost}</span>
          <span>Power: {card.power}</span>
          {card.counter_value > 0 && <span>Counter: +{card.counter_value}</span>}
        </div>

        {(onAdd || onRemove) && (
          <div className="flex items-center gap-2">
            {onRemove && count > 0 && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onRemove(card)}>
                <Minus className="h-3 w-3 mr-1" /> Remove
              </Button>
            )}
            {onAdd && (
              <Button size="sm" className="flex-1" onClick={() => onAdd(card)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
