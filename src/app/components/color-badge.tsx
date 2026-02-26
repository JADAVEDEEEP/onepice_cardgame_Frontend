import { cn } from './ui/utils';
import { OPTCGColor } from '../data/mockData';

interface ColorBadgeProps {
  color: OPTCGColor;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const colorConfig: Record<OPTCGColor, { bg: string; text: string; label: string }> = {
  red: {
    bg: 'bg-[var(--accent-red)]',
    text: 'text-white',
    label: 'Red'
  },
  blue: {
    bg: 'bg-[var(--accent-blue)]',
    text: 'text-white',
    label: 'Blue'
  },
  green: {
    bg: 'bg-[var(--accent-green)]',
    text: 'text-white',
    label: 'Green'
  },
  purple: {
    bg: 'bg-[var(--accent-purple)]',
    text: 'text-white',
    label: 'Purple'
  },
  black: {
    bg: 'bg-[var(--accent-black)]',
    text: 'text-white',
    label: 'Black'
  },
  yellow: {
    bg: 'bg-[var(--accent-yellow)]',
    text: 'text-black',
    label: 'Yellow'
  }
};

export function ColorBadge({ color, size = 'md', showLabel = true, className }: ColorBadgeProps) {
  const config = colorConfig[color];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={cn(
        config.bg,
        config.text,
        sizeClasses[size],
        'rounded-full font-medium inline-flex items-center gap-1',
        className
      )}
    >
      {showLabel && config.label}
    </span>
  );
}

// Multiple color badges
interface ColorBadgesProps {
  colors: OPTCGColor[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ColorBadges({ colors, size = 'sm', className }: ColorBadgesProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {colors.map((color) => (
        <ColorBadge key={color} color={color} size={size} showLabel={false} />
      ))}
    </div>
  );
}