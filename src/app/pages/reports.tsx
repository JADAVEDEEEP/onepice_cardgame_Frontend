import { Card } from '../components/ui/card';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Reports & Export</h1>
        <p className="text-[var(--text-secondary)]">Generate and export analytics reports</p>
      </div>
      <Card className="p-12 bg-[var(--surface-1)] border-[var(--border-default)] text-center">
        <p className="text-[var(--text-muted)]">Reports functionality coming soon...</p>
      </Card>
    </div>
  );
}
