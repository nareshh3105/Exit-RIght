'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouteStore } from '@/store/useRouteStore';
import { Icon } from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import { ER } from '@/lib/tokens';
import { getSavedRoutes } from '@/lib/api/saved';
import { getTripHistory } from '@/lib/api/trips';
import { getWeather } from '@/lib/api/weather';
import { getStations } from '@/lib/api/stations';
import type { SavedRoute, TripHistory, WeatherData } from '@/types';

const FALLBACK_SAVED = [
  { label: 'Home',    sub: 'T. Nagar · 2.4 km',   icon: 'home' as const, color: ER.green },
  { label: 'Office',  sub: 'Tidel Park · 1.8 km',  icon: 'bag'  as const, color: ER.blue  },
  { label: 'College', sub: 'IIT Madras · 0.9 km',  icon: 'flag' as const, color: ER.amber },
];
const FALLBACK_RECENT = [
  { from: 'Guindy',  to: 'Phoenix Mall',    via: 'Cab · 14m',     when: 'Yesterday' },
  { from: 'Alandur', to: 'Express Avenue',  via: 'Bus 21G · 22m', when: 'Mon'       },
];

export default function HomePage() {
  const router  = useRouter();
  const profile = useAuthStore(s => s.profile);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [recentTrips, setRecentTrips] = useState<TripHistory[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [savedRes, tripsRes, stationsRes] = await Promise.all([
        profile?.id ? getSavedRoutes(profile.id) : Promise.resolve({ data: null, error: null }),
        profile?.id ? getTripHistory(profile.id, 1, 3) : Promise.resolve({ data: null, error: null }),
        getStations(),
      ]);

      if (savedRes.data) setSavedRoutes(savedRes.data);
      if (tripsRes.data) setRecentTrips(tripsRes.data.data);

      if (stationsRes.data) {
        const homeStation = stationsRes.data.find(s => s.name === (profile?.homeStation ?? 'Guindy'));
        if (homeStation?.id) {
          const weatherRes = await getWeather(homeStation.id);
          if (weatherRes.data) setWeather(weatherRes.data);
        }
      }
      setLoading(false);
    }
    load();
  }, [profile?.id, profile?.homeStation]);

  const SAVED = savedRoutes.length > 0
    ? savedRoutes.map(r => ({ label: r.name, sub: `${r.address} · ${r.estimatedEta}`, icon: r.icon as 'home' | 'bag' | 'flag', color: r.color }))
    : FALLBACK_SAVED;

  const RECENT = recentTrips.length > 0
    ? recentTrips.map(t => ({
        from: t.fromStation,
        to: t.toDestination,
        via: `${t.modeUsed.charAt(0).toUpperCase() + t.modeUsed.slice(1)} · ₹${t.actualCost}`,
        when: new Date(t.departedAt).toLocaleDateString('en-IN', { weekday: 'short' }),
      }))
    : FALLBACK_RECENT;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ paddingTop: 52, paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: ER.mute, fontWeight: 500 }}>{greeting}, {profile?.fullName?.split(' ')[0] ?? 'there'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Icon name="pin" size={15} color={ER.green}/>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{profile?.homeStation ?? 'Guindy'} Metro</div>
            <Icon name="chevD" size={15} color={ER.mute}/>
            <span style={{ marginLeft: 2, fontSize: 11, padding: '2px 7px', borderRadius: 99, background: ER.greenS, color: '#047857', fontWeight: 700 }}>40 m</span>
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 99,
          background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
          color: ER.ink, fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {profile?.avatarInitials ?? 'ME'}
        </div>
      </div>

      {/* CTA card */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div className="er-tap" onClick={() => router.push('/station')} style={{
          borderRadius: 22, padding: 20,
          background: `linear-gradient(160deg, ${ER.ink} 0%, #1E293B 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: ER.cardHi,
        }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)'}}/>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)'}}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: ER.green, boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: ER.green, letterSpacing: 1, textTransform: 'uppercase' }}>Live · platform 2</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, marginBottom: 4 }}>Heading somewhere?</div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>We'll pick the right gate and last-mile in one tap.</div>
          <div style={{
            height: 48, borderRadius: 12, background: ER.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#062B1F', fontWeight: 700, fontSize: 15,
            boxShadow: '0 8px 18px rgba(16,185,129,0.35)',
          }}>
            Find Best Exit
            <Icon name="arrow" size={18} color="#062B1F" strokeWidth={2.5}/>
          </div>
        </div>
      </div>

      {/* Weather alert */}
      {weather && weather.rainProbability > 30 && (
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 12, border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: ER.amberS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="rain" size={20} color={ER.amber}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {weather.condition === 'rain' ? 'Raining now' : `Rain likely — ${weather.rainProbability}% chance`}
            </div>
            <div style={{ fontSize: 12, color: ER.mute }}>Prefer covered exits and cab today.</div>
          </div>
          <Icon name="chev" size={16} color={ER.mute}/>
        </div>
      </div>
      )}
      {weather && weather.tempCelsius > 38 && (
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 12, border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: ER.redS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sun" size={20} color={ER.red}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Extreme heat — {Math.round(weather.tempCelsius)}°C</div>
            <div style={{ fontSize: 12, color: ER.mute }}>Stay hydrated, prefer AC transport.</div>
          </div>
        </div>
      </div>
      )}

      {/* Saved routes */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: ER.mute }}>Saved routes</div>
        <div className="er-tap" onClick={() => router.push('/saved')} style={{ fontSize: 13, fontWeight: 600, color: ER.ink2 }}>See all</div>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto' }}>
        {SAVED.map(r => (
          <div key={r.label} className="er-tap" onClick={() => router.push('/recommendation')} style={{ minWidth: 140, padding: 14, borderRadius: 16, background: '#fff', border: `1px solid ${ER.line}` }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: r.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name={r.icon} size={16} color={r.color}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
            <div style={{ fontSize: 11.5, color: ER.mute, marginTop: 2 }}>{r.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: ER.mute, marginBottom: 12 }}>Recent</div>
        {RECENT.map((r, i) => (
          <div key={i} className="er-tap" onClick={() => router.push('/recommendation')} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: i === 0 ? `1px solid ${ER.line}` : 'none',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ER.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="swap" size={18} color={ER.ink3}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.from} → {r.to}</div>
              <div style={{ fontSize: 12, color: ER.mute, marginTop: 2 }}>{r.via} · {r.when}</div>
            </div>
            <div style={{ padding: '6px 10px', borderRadius: 8, background: ER.bg, fontSize: 12, fontWeight: 600 }}>Repeat</div>
          </div>
        ))}
      </div>
    </div>
  );
}
