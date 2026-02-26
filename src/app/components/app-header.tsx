import { Search, User, Upload } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 bg-[var(--surface-1)] border-b border-[var(--border-default)]">
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Logo for mobile */}
        <div className="lg:hidden">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">OPTCG DeckLab</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              type="text"
              placeholder="Search cards by name or code (e.g., OP01-016)..."
              className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>My Decks</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}