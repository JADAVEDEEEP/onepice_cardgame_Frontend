import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
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

export default function MetaTrends() {
  const [status, setStatus] = useState<WatcherStatus | null>(null);
  const [events, setEvents] = useState<WatchedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, recentResPrimary] = await Promise.all([
        fetch(withApiBase('/watcher/status')),
        fetch(withApiBase('/watcher/recent')),
      ]);
      const recentRes =
        recentResPrimary.status === 404
          ? await fetch(withApiBase('/watcher.js/recent'))
          : recentResPrimary;
      const [statusJson, recentJson] = await Promise.all([
        statusRes.json().catch(() => ({})),
        recentRes.json().catch(() => ({})),
      ]);
      if (!statusRes.ok) throw new Error(statusJson?.message || 'Failed to load watcher status');
      if (!recentRes.ok) throw new Error(recentJson?.message || 'Failed to load watcher events');
      setStatus(statusJson as WatcherStatus);
      setEvents(Array.isArray(recentJson?.events) ? (recentJson.events as WatchedEvent[]) : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const runNow = async () => {
    try {
      setRunningNow(true);
      setMessage('Running watcher...');
      const response = await fetch(withApiBase('/watcher/run-now'), { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || 'Watcher run failed');
      const newCount = Number(payload?.new_posts || 0);
      const sent = Boolean(payload?.sent_email);
      setMessage(`Run complete: ${newCount} new event(s)${sent ? ', email sent.' : '.'}`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Watcher run failed');
    } finally {
      setRunningNow(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Events</h1>
        <p className="text-[var(--text-secondary)]">Official One Piece topics watcher and email alerts</p>
      </div>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="space-y-1 text-sm">
            <p><span className="text-[var(--text-muted)]">Watcher:</span> <span className="font-medium">{status?.running ? 'Running' : 'Idle'}</span></p>
            <p><span className="text-[var(--text-muted)]">Last Run:</span> <span className="font-medium">{status?.last_run_at || 'N/A'}</span></p>
            <p><span className="text-[var(--text-muted)]">Last New Count:</span> <span className="font-medium">{status?.last_new_count ?? 0}</span></p>
            <p><span className="text-[var(--text-muted)]">Interval:</span> <span className="font-medium">{status?.interval_ms ? `${Math.round(status.interval_ms / 60000)} min` : 'N/A'}</span></p>
            {status?.last_error && <p className="text-[var(--state-danger)]">Last Error: {status.last_error}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => void runNow()} disabled={runningNow}>
              {runningNow ? 'Running...' : 'Run Now'}
            </Button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-[var(--text-muted)]">{message}</p>}
      </Card>

      <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recent Detected Events</h3>
        {events.length === 0 ? (
          <p className="text-[var(--text-muted)]">No events detected yet.</p>
        ) : (
          <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
            {events.map((event) => (
              <div key={event.url} className="rounded-lg border border-[var(--border-default)] p-3 bg-[var(--surface-2)]">
                <p className="font-medium text-[var(--text-primary)]">{event.title || event.url}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Published: {extractDisplayDate(event) || 'N/A'} | Seen: {event.first_seen_at || 'N/A'}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{event.summary || '-'}</p>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent-blue)] underline mt-2 inline-block break-all"
                >
                  {event.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
