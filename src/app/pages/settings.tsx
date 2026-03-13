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

type WatchedEvent = {
  url: string;
  title: string;
  published_at: string;
  summary: string;
  first_seen_at: string | null;
  last_notified_at: string | null;
};

const DATE_PATTERN =
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b/i;

const extractDisplayDate = (event: WatchedEvent) => {
  const direct = String(event.published_at || '').trim();
  if (direct) return direct;
  const match = `${event.title || ''} ${event.summary || ''}`.match(DATE_PATTERN);
  return match ? match[0] : '';
};

export default function Settings() {
  const [watcherStatus, setWatcherStatus] = useState<WatcherStatus | null>(null);
  const [watcherEvents, setWatcherEvents] = useState<WatchedEvent[]>([]);
  const [eventsVisibleCount, setEventsVisibleCount] = useState(10);
  const [watcherLoading, setWatcherLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
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

  const loadWatcherEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await fetch(withApiBase('/watcher/recent?limit=all'));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || `Failed to load watcher events (${response.status})`);
      const events = Array.isArray(payload?.events) ? (payload.events as WatchedEvent[]) : [];
      setWatcherEvents(events);
      setEventsVisibleCount(10);
    } catch (error) {
      setWatcherMessage(error instanceof Error ? error.message : 'Failed to load watcher events');
    } finally {
      setEventsLoading(false);
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
      await loadWatcherEvents();
    } catch (error) {
      setWatcherMessage(error instanceof Error ? error.message : 'Watcher run failed');
    } finally {
      setWatcherActionLoading(false);
    }
  };

  useEffect(() => {
    void loadWatcherStatus();
    void loadWatcherEvents();
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">Topic Watcher Alerts</h3>
          <Button
            variant="outline"
            onClick={() => {
              void loadWatcherStatus();
              void loadWatcherEvents();
            }}
            disabled={watcherLoading || eventsLoading}
          >
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
      </Card>

      <Card className="p-4 sm:p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">Recent Events</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Showing {Math.min(eventsVisibleCount, watcherEvents.length)} of {watcherEvents.length}
          </p>
        </div>
        {eventsLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading events...</p>
        ) : watcherEvents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No events detected yet.</p>
        ) : (
          <div className="space-y-3">
            {watcherEvents.slice(0, eventsVisibleCount).map((event) => (
              <div key={event.url} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] p-3">
                <p className="font-medium text-sm text-[var(--text-primary)]">{event.title || event.url}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Published: {extractDisplayDate(event) || 'N/A'} | Seen: {event.first_seen_at || 'N/A'}
                </p>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block break-all text-xs text-[var(--accent-blue)] underline"
                >
                  {event.url}
                </a>
              </div>
            ))}
            {eventsVisibleCount < watcherEvents.length && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setEventsVisibleCount((prev) => prev + 10)}
              >
                Load More Events
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
