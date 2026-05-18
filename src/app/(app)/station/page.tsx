'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { Icon } from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import { ER } from '@/lib/tokens';
import { getStations, getNearestStation } from '@/lib/api/stations';
import type { Station } from '@/types';

const LINE_COLOR = {
  'Blue':       [ER.blue],
  'Green':      [ER.green],
  'Blue/Green': [ER.blue, ER.green],
} as const;

export default function StationPage() {
  const router = useRouter();
  const setFromStation = useRouteStore(s => s.setFromStation);
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<'All' | 'Blue' | 'Green' | 'Nearby'>('All');
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getStations();
      if (res.data) {
        const stations = res.data;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const nearRes = await getNearestStation(pos.coords.latitude, pos.coords.longitude);
              if (nearRes.data) {
                setAllStations(stations.map(s => ({
                  ...s,
                  isNearest: s.id === nearRes.data!.id,
                  distanceKm: s.lat && s.lng
                    ? Math.round(haversine(pos.coords.latitude, pos.coords.longitude, s.lat, s.lng) * 10) / 10
                    : undefined,
                })));
              } else {
                setAllStations(stations);
              }
              setLoading(false);
            },
            () => { setAllStations(stations); setLoading(false); },
            { timeout: 3000 },
          );
        } else {
          setAllStations(stations);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    load();
  }, []);

  const shown = allStations.filter(s => {
    const matchesQuery  = !query || s.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === 'All'    ? true :
      filter === 'Nearby' ? (s.distanceKm ?? 99) < 2 :
      s.line.includes(filter);
    return matchesQuery && matchesFilter;
  });

  function handleSelect(station: Station) {
    setSelected(station.name);
    setFromStation(station);
    setTimeout(() => router.push('/destination'), 180);
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BackBtn />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>From</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>Pick a station</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <div style={{ height: 52, background: '#fff', borderRadius: 16, border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <Icon name="search" size={18} color={ER.mute}/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stations…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit', color: ER.ink, background: 'transparent' }}
          />
          {query && <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Icon name="x" size={16} color={ER.mute}/></button>}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 16 }}>
        {(['All', 'Blue', 'Green', 'Nearby'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 12px', borderRadius: 999,
            background: filter === f ? ER.ink : '#fff',
            color:      filter === f ? '#fff' : ER.ink2,
            border: `1px solid ${filter === f ? ER.ink : ER.line}`,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{f}</button>
        ))}
      </div>

      {/* Station list */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: ER.mute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
          {shown.length} station{shown.length !== 1 ? 's' : ''}
        </div>
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${ER.line}`, overflow: 'hidden' }}>
          {shown.map((s, i) => {
            const cs = LINE_COLOR[s.line];
            const isSel = selected === s.name;
            return (
              <div key={s.id} className="er-tap" onClick={() => handleSelect(s)} style={{
                padding: '14px', borderTop: i === 0 ? 'none' : `1px solid ${ER.line2}`,
                display: 'flex', alignItems: 'center', gap: 12,
                background: isSel ? ER.greenS : s.isNearest ? 'rgba(16,185,129,0.04)' : 'transparent',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: ER.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {cs.length === 1 ? (
                    <span style={{ width: 14, height: 14, borderRadius: 99, background: cs[0] }}/>
                  ) : (
                    <div style={{ display: 'flex', gap: 1 }}>
                      <span style={{ width: 9, height: 14, background: cs[0], borderRadius: '99px 0 0 99px' }}/>
                      <span style={{ width: 9, height: 14, background: cs[1], borderRadius: '0 99px 99px 0' }}/>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>
                    {s.name}
                    {s.isNearest && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: ER.green, color: '#fff', fontWeight: 700, letterSpacing: 0.5, verticalAlign: 'middle' }}>NEAREST</span>}
                  </div>
                  <div style={{ fontSize: 12, color: ER.mute, marginTop: 2 }}>{s.line} · {s.distanceKm} km</div>
                </div>
                {isSel
                  ? <div style={{ width: 22, height: 22, borderRadius: 99, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={13} color="#fff" strokeWidth={3}/></div>
                  : <Icon name="chev" size={16} color={ER.mute}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
