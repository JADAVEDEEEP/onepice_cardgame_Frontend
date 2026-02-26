import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';
import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  dataSource?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  dataSource,
  className
}: KPICardProps) {
  return (
    <div className={cn(
      "bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-14)] p-6 hover:border-[var(--border-soft)] transition-colors",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[var(--text-secondary)] text-sm mb-2">{title}</p>
          <div className="text-3xl font-semibold text-[var(--text-primary)] mb-1">{value}</div>
          {subtitle && (
            <p className="text-[var(--text-muted)] text-xs">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' && "text-[var(--state-success)]",
                trend === 'down' && "text-[var(--state-danger)]",
                trend === 'neutral' && "text-[var(--text-muted)]"
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[var(--surface-2)] rounded-lg">
            <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
          </div>
        )}
      </div>
      {dataSource && (
        <div className="mt-3 pt-3 border-t border-[var(--border-soft)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            Data: {dataSource}
          </p>
        </div>
      )}
    </div>
  );
}