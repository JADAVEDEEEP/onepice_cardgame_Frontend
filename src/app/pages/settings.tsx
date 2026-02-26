import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your preferences and account</p>
      </div>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Card Codes</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Share Anonymous Data</Label>
            <Switch />
          </div>
          <Button variant="destructive">Clear All Data</Button>
        </div>
      </Card>
    </div>
  );
}
