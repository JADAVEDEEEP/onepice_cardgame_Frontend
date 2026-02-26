import { cn } from './ui/utils';

interface DataSourceLabelProps {
  source: string;
  className?: string;
}

export function DataSourceLabel({ source, className }: DataSourceLabelProps) {
  return (
    <div className={cn('mt-3 pt-3 border-t border-[var(--border-soft)]', className)}>
      <p className="text-[10px] text-[var(--text-muted)] font-mono">
        Data: {source}
      </p>
    </div>
  );
}