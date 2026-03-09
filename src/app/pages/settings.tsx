import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { withApiBase } from '../data/apiBase';

type WatcherStatus = {
  running: boolean;
  last_run_at: string | null;
  last_error: string | null;
  last_new_count: number;
  source_url: string;
  interval_ms: number;
};

export default function Settings() {
  const [watcherStatus, setWatcherStatus] = useState<WatcherStatus | null>(null);
  const [watcherLoading, setWatcherLoading] = useState(false);
  const [watcherActionLoading, setWatcherActionLoading] = useState(false);
  const [watcherMessage, setWatcherMessage] = useState<string | null>(null);

  const loadWatcherStatus = async () => {
    try {
      setWatcherLoading(true);
      const response = await fetch(withApiBase('/watcher/status'));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || `Failed to load watcher status (${response.status})`);
      setWatcherStatus(payload as WatcherStatus);
    } catch (error) {
      setWatcherMessage(error instanceof Error ? error.message : 'Failed to load watcher status');
    } finally {
      setWatcherLoading(false);
    }
  };

  const runWatcherNow = async () => {
    try {
      setWatcherActionLoading(true);
      setWatcherMessage('Running watcher...');
      const response = await fetch(withApiBase('/watcher/run-now'), { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || `Watcher run failed (${response.status})`);
      const newPosts = Number(payload?.new_posts || 0);
      const sent = Boolean(payload?.sent_email);
      setWatcherStatus((payload?.status || null) as WatcherStatus | null);
      setWatcherMessage(
        `Run complete: ${newPosts} new post(s)${sent ? ' and email sent.' : '.'}`
      );
    } catch (error) {
      setWatcherMessage(error instanceof Error ? error.message : 'Watcher run failed');
    } finally {
      setWatcherActionLoading(false);
    }
  };

  useEffect(() => {
    void loadWatcherStatus();
  }, []);

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

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Topic Watcher Alerts</h3>
          <Button variant="outline" onClick={() => void loadWatcherStatus()} disabled={watcherLoading}>
            {watcherLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-[var(--text-muted)]">Status: </span>
            <span className="font-medium">{watcherStatus?.running ? 'Running' : 'Idle'}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Last Run: </span>
            <span className="font-medium">{watcherStatus?.last_run_at || 'N/A'}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Last New Posts: </span>
            <span className="font-medium">{watcherStatus?.last_new_count ?? 0}</span>
          </p>
          <p className="truncate">
            <span className="text-[var(--text-muted)]">Source URL: </span>
            <span className="font-mono text-xs">{watcherStatus?.source_url || 'N/A'}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Interval: </span>
            <span className="font-medium">
              {watcherStatus?.interval_ms ? `${Math.round(watcherStatus.interval_ms / 60000)} min` : 'N/A'}
            </span>
          </p>
          {watcherStatus?.last_error && (
            <p className="text-[var(--state-danger)]">Last Error: {watcherStatus.last_error}</p>
          )}
          {watcherMessage && <p className="text-[var(--text-muted)]">{watcherMessage}</p>}
        </div>
        <div className="mt-4">
          <Button onClick={() => void runWatcherNow()} disabled={watcherActionLoading}>
            {watcherActionLoading ? 'Running...' : 'Run Watcher Now'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
