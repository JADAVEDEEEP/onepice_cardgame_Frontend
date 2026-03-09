import { Link, useLocation } from 'react-router';
import { cn } from './ui/utils';
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  Layers,
  GitCompare,
  Grid3x3,
  Search,
  TrendingUp,
  BookMarked,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Best Color Finder', href: '/color-finder', icon: Palette },
  { name: 'Generate Best Deck', href: '/generate-deck', icon: Sparkles },
  { name: 'Deck Builder', href: '/deck-builder', icon: Layers },
  { name: 'Deck Compare', href: '/deck-compare', icon: GitCompare },
  { name: 'Matchup Matrix', href: '/matchup-matrix', icon: Grid3x3 },
  { name: 'Card Explorer', href: '/card-explorer', icon: Search },
  { name: 'Events', href: '/events', icon: TrendingUp },
  { name: 'My Collection', href: '/my-collection', icon: BookMarked },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings }
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn('w-64 bg-[var(--surface-1)] border-r border-[var(--border-default)] flex flex-col', className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">OPTCG DeckLab</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Competitive Analytics</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-blue)] text-white font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="text-xs text-[var(--text-muted)]">
          <p>Data updated: Feb 24, 2026</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}

// Mobile navigation
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--surface-1)] rounded-lg border border-[var(--border-default)]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface-1)] border-r border-[var(--border-default)] z-40 transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 pt-16">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">OPTCG DeckLab</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Competitive Analytics</p>
        </div>

        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--accent-blue)] text-white font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// Bottom tab bar for mobile
const mobileNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Builder', href: '/deck-builder', icon: Layers },
  { name: 'Explore', href: '/card-explorer', icon: Search },
  { name: 'Compare', href: '/deck-compare', icon: GitCompare },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-1)] border-t border-[var(--border-default)] z-30">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 text-xs transition-colors flex-1',
                isActive
                  ? 'text-[var(--accent-blue)]'
                  : 'text-[var(--text-muted)]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
