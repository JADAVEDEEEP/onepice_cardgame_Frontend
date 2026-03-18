import { Link, useLocation } from 'react-router';
import type { ComponentType } from 'react';
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
  GraduationCap,
  BookMarked,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const productNavigation = [
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

const learningNavigation = [
  { name: 'Learning Guide Home', href: '/learning-guide', icon: GraduationCap },
  { name: 'Table of Contents', href: '/learning-guide/toc', icon: FileText },
  { name: 'Game Basics', href: '/learning-guide/basics', icon: GraduationCap },
  { name: 'Turn Phases', href: '/learning-guide/phases', icon: Layers },
  { name: 'Win, Lose & Draw', href: '/learning-guide/gameendconditions', icon: TrendingUp },
  { name: 'DON!! System', href: '/learning-guide/donsystem', icon: Sparkles },
  { name: 'Game Zones', href: '/learning-guide/gamezones', icon: Grid3x3 },
  { name: 'Card Mastery', href: '/learning-guide/cardmastery', icon: BookMarked },
  { name: 'Card Types', href: '/learning-guide/cards', icon: Search },
  { name: 'Combat System', href: '/learning-guide/combat', icon: GitCompare },
  { name: 'Priority & Actions', href: '/learning-guide/priority', icon: Palette },
  { name: 'Practice Scenarios', href: '/learning-guide/scenarios', icon: LayoutDashboard },
  { name: 'Decision Tables', href: '/learning-guide/decisions', icon: FileText },
  { name: 'Quick Cheatsheet', href: '/learning-guide/cheatsheet', icon: FileText },
  { name: 'Pro Player System', href: '/learning-guide/prosystem', icon: GraduationCap },
  { name: 'Masterpiece Moves', href: '/learning-guide/masterpiecemoves', icon: TrendingUp },
  { name: 'Color Execution', href: '/learning-guide/colorexecution', icon: Palette },
  { name: 'Decision Logic', href: '/learning-guide/decisionlogic', icon: GitCompare },
  { name: 'Progress', href: '/learning-guide/progress', icon: TrendingUp },
  { name: 'Data Sync', href: '/learning-guide/datasync', icon: Grid3x3 },
  { name: 'Tournament Import', href: '/learning-guide/tournamentimport', icon: FileText },
  { name: 'AI Coach', href: '/learning-guide/aicoach', icon: Sparkles },
  { name: 'Meta Snapshot', href: '/learning-guide/metasnapshot', icon: TrendingUp },
  { name: 'Training Playlist', href: '/learning-guide/trainingplaylist', icon: BookMarked },
  { name: 'Deck Finder', href: '/learning-guide/deckfinder', icon: Search },
  { name: 'Matchup Optimizer', href: '/learning-guide/matchupoptimizer', icon: GitCompare },
  { name: 'Meta Counter Builder', href: '/learning-guide/metacounterbuilder', icon: Layers },
  { name: 'Consistency Analyzer', href: '/learning-guide/consistencyanalyzer', icon: Grid3x3 },
  { name: 'AI Verdict', href: '/learning-guide/aiverdict', icon: Sparkles },
  { name: 'Guide Settings', href: '/learning-guide/settings', icon: Settings }
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation();

  const renderNavItem = (item: { name: string; href: string; icon: ComponentType<{ className?: string }> }) => {
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
        <Icon className="w-5 h-5 shrink-0" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className={cn('w-64 bg-[var(--surface-1)] border-r border-[var(--border-default)] flex flex-col', className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">OPTCG DeckLab</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Competitive Analytics</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)]/70 p-2 shadow-sm">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
            DeckLab
          </p>
          {productNavigation.map(renderNavItem)}
        </div>

        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)]/70 p-2 shadow-sm">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-yellow)]">
            Learning Guide
          </p>
          {learningNavigation.map(renderNavItem)}
        </div>
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
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className={cn(
          'lg:hidden fixed left-3 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border-2 shadow-lg transition-all',
          'bg-[var(--surface-1)] text-white border-[var(--border-default)]',
          'hover:bg-[var(--surface-2)] active:scale-95',
          'ring-1 ring-black/30'
        )}
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
          'lg:hidden fixed left-0 top-0 bottom-0 z-40 flex w-72 flex-col border-r border-[var(--border-default)] bg-[var(--surface-1)] transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 pt-16">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">OPTCG DeckLab</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Competitive Analytics</p>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-6">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)]/70 p-2 shadow-sm">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
              DeckLab
            </p>
            {productNavigation.map((item) => {
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
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)]/70 p-2 shadow-sm">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-yellow)]">
              Learning Guide
            </p>
            {learningNavigation.map((item) => {
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
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
