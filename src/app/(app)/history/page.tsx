'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getTripHistory, getTripStats } from '@/lib/api/trips';
import { Pill } from '@/components/ui/Pill';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import type { TripHistory } from '@/types';

function groupByDay(trips: TripHistory[]) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: Record<string, TripHistory[]> = {};
  trips.forEach(t => {
    const d = new Date(t.departedAt).toDateString();
    const label = d === today ? 'TODAY' : d === yesterday ? 'YESTERDAY' : new Date(t.departedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    (groups[label] ??= []).push(t);
  });
  return groups;
}

export default function HistoryPage() {
  const router  = useRouter();
  const profile = useAuthStore(s => s.profile);
  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [stats, setStats] = useState({ totalTrips: 0, totalSaved: 0, topGate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      getTripHistory(profile.id),
      getTripStats(profile.id),
    ]).then(([tripsRes, statsRes]) => {
      if (tripsRes.data?.data.length) setTrips(tripsRes.data.data);
      if (statsRes) setStats({ totalTrips: statsRes.totalTrips, totalSaved: statsRes.totalSaved, topGate: statsRes.topGate ?? 0 });
      setLoading(false);
    });
  }, [profile]);

  const groups = groupByDay(trips);
  const tagStyle: Record<string, { bg: string; fg: string }> = {
    good:   { bg: ER.greenS, fg: '#047857' },
    safety: { bg: '#F5F3FF', fg: '#7C3AED' },
  };

  return (
    <div>
      <div style={{ padding: '52px 20px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {stats.totalTrips} trips
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>History</div>
      </div>

      {/* Stats */}
      {stats.totalTrips > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 20px 16px' }}>
          {[
            { label: 'Saved',    value: `₹${stats.totalSaved.toLocaleString('en-IN')}`, tone: ER.green },
            { label: 'Trips',    value: `${stats.totalTrips}`,                           tone: ER.ink   },
            { label: 'Top gate', value: stats.topGate ? `Gate ${stats.topGate}` : '—',  tone: ER.blue  },
          ].map(s => (
            <div key={s.label} style={{ padding: 12, borderRadius: 14, background: '#fff', border: `1px solid ${ER.line}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: ER.mute, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: s.tone, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grouped trips */}
      <div style={{ padding: '0 20px 24px' }}>
        {loading ? (
          <div style={{ color: ER.mute, fontSize: 13, padding: '16px 0' }}>Loading trips…</div>
        ) : trips.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ER.ink2 }}>No trips yet</div>
            <div style={{ fontSize: 13, color: ER.mute, marginTop: 4 }}>Your commute history will appear here.</div>
          </div>
        ) : Object.entries(groups).map(([day, dayTrips]) => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: ER.ink }}>{day}</span>
              <span style={{ flex: 1, height: 1, background: ER.line }}/>
            </div>
            {dayTrips.map((t) => {
              const tag = tagStyle[t.tagTone ?? 'good'];
              const time = new Date(t.departedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={t.id} className="er-tap" onClick={() => router.push('/recommendation')} style={{
                  display: 'flex', gap: 12, padding: '12px 14px',
                  background: '#fff', borderRadius: 14, border: `1px solid ${ER.line2}`, marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 99, background: ER.green, border: '2px solid #fff', boxShadow: `0 0 0 1px ${ER.green}` }}/>
                    <span style={{ flex: 1, width: 1, background: ER.line, marginTop: 4 }}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.fromStation} → {t.toDestination}</div>
                      <div style={{ fontSize: 11, color: ER.mute, fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>{time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <Pill bg={ER.bg} color={ER.ink2}>Gate {t.gateUsed}</Pill>
                      <Pill bg={ER.bg} color={ER.ink2}><Icon name={t.modeUsed as any} size={11} color={ER.ink2}/></Pill>
                      <Pill bg={ER.bg} color={ER.ink2} mono>₹{t.actualCost}</Pill>
                      {t.tag && <Pill bg={tag.bg} color={tag.fg}>{t.tag}</Pill>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
