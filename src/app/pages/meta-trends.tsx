import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { withApiBase } from '../data/apiBase';
import { Activity, Clock, RefreshCw, AlertCircle, Hash, Timer } from 'lucide-react';

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

const formatTimestamp = (raw: string | null): string => {
  if (!raw) return 'N/A';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return raw;
  }
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  COMPETITIVE: { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  OTHER:       { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc' },
  'CARD LIST': { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  DEFAULT:     { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
};

const getTag = (title: string) => {
  const upper = title.toUpperCase();
  if (upper.includes('COMPETITIVE')) return 'COMPETITIVE';
  if (upper.includes('CARD LIST'))   return 'CARD LIST';
  if (upper.includes('OTHER'))       return 'OTHER';
  return null;
};

const cleanTitle = (title: string) =>
  title.replace(/\.\s*(COMPETITIVE|OTHER|CARD LIST)[^.]*$/i, '').trim();

export default function MetaTrends() {
  const [status, setStatus]             = useState<WatcherStatus | null>(null);
  const [events, setEvents]             = useState<WatchedEvent[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, recentResPrimary] = await Promise.all([
        fetch(withApiBase('/watcher/status')),
        fetch(withApiBase('/watcher/recent?limit=all')),
      ]);
      const recentRes =
        recentResPrimary.status === 404
          ? await fetch(withApiBase('/watcher.js/recent?limit=all'))
          : recentResPrimary;
      const [statusJson, recentJson] = await Promise.all([
        statusRes.json().catch(() => ({})),
        recentRes.json().catch(() => ({})),
      ]);
      if (!statusRes.ok) throw new Error(statusJson?.message || 'Failed to load watcher status');
      if (!recentRes.ok) throw new Error(recentJson?.message || 'Failed to load watcher events');
      setStatus(statusJson as WatcherStatus);
      setEvents(Array.isArray(recentJson?.events) ? (recentJson.events as WatchedEvent[]) : []);
      setVisibleCount(30);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const isRunning = status?.running ?? false;

  const statDivider = (
    <div style={{ width: 1, height: 32, background: 'var(--border-default)', flexShrink: 0 }} />
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Events</h1>
        <p className="text-sm text-[var(--text-secondary)]">Official One Piece topics watcher and email alerts</p>
      </div>

      {/* Watcher status card */}
      <Card className="bg-[var(--surface-1)] border-[var(--border-default)]" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

            {/* Status pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: isRunning ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
              color:      isRunning ? '#34d399'              : '#9ca3af',
              border:     `1px solid ${isRunning ? 'rgba(16,185,129,0.25)' : 'rgba(107,114,128,0.25)'}`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                background: isRunning ? '#34d399' : '#6b7280',
                boxShadow: isRunning ? '0 0 6px #34d399' : 'none',
              }} />
              {isRunning ? 'Running' : 'Idle'}
            </span>

            {statDivider}

            {/* Last Run */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--surface-2)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Last Run</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {formatTimestamp(status?.last_run_at ?? null)}
                </p>
              </div>
            </div>

            {statDivider}

            {/* New Events */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--surface-2)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Hash style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>New Events</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {status?.last_new_count ?? 0}
                </p>
              </div>
            </div>

            {statDivider}

            {/* Interval */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--surface-2)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Timer style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Interval</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {status?.interval_ms ? `${Math.round(status.interval_ms / 60000)} min` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Error badge */}
            {status?.last_error && (
              <>
                {statDivider}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#f87171' }}>{status.last_error}</p>
                </div>
              </>
            )}
          </div>

          {/* Refresh button only */}
          <button
            onClick={() => void loadData()}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 14px', borderRadius: 8,
              border: '1px solid var(--border-default)',
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}
          >
            <RefreshCw style={{ width: 12, height: 12 }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {message && (
          <div style={{
            marginTop: 12, padding: '7px 12px', borderRadius: 8,
            background: 'var(--surface-2)', border: '1px solid var(--border-default)',
            fontSize: 12, color: 'var(--text-secondary)',
          }}>
            {message}
          </div>
        )}
      </Card>

      {/* Events list */}
      <Card className="bg-[var(--surface-1)] border-[var(--border-default)]" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              Recent Detected Events
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {events.length > 0 ? `${events.length} total events` : 'No events yet'}
            </p>
          </div>
          <Activity style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No events detected yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '62vh', overflowY: 'auto', paddingRight: 4 }}>
            {events.slice(0, visibleCount).map((event) => {
              const tag = getTag(event.title);
              const tagStyle = tag ? TAG_COLORS[tag] : TAG_COLORS.DEFAULT;
              const displayTitle = cleanTitle(event.title || event.url);
              const displayDate  = extractDisplayDate(event);

              return (
                <div key={event.url} style={{
                  borderRadius: 10, border: '1px solid var(--border-default)',
                  padding: '14px 16px', background: 'var(--surface-2)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
                      {displayTitle}
                    </p>
                    {tag && (
                      <span style={{
                        flexShrink: 0, fontSize: 10, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 999,
                        background: tagStyle.bg, color: tagStyle.text,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {tag}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {displayDate && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock style={{ width: 11, height: 11 }} />{displayDate}
                      </span>
                    )}
                    {event.first_seen_at && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Activity style={{ width: 11, height: 11 }} />Seen: {event.first_seen_at}
                      </span>
                    )}
                  </div>

                  {event.summary && event.summary !== '-' && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {event.summary}
                    </p>
                  )}

                  <a href={event.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, color: 'var(--accent-blue)', textDecoration: 'none',
                    wordBreak: 'break-all', marginTop: 2, opacity: 0.85,
                  }}>
                    {event.url}
                  </a>
                </div>
              );
            })}

            {visibleCount < events.length && (
              <div style={{ paddingTop: 4 }}>
                <button onClick={() => setVisibleCount((prev) => prev + 30)} style={{
                  width: '100%', height: 36, borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'var(--surface-2)', color: 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer',
                }}>
                  Load More ({events.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}