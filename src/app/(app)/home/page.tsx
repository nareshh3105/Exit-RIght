'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouteStore } from '@/store/useRouteStore';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import { getStations, getNearestStation } from '@/lib/api/stations';
import type { Station } from '@/types';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function HomePage() {
  const router = useRouter();
  const profile = useAuthStore(s => s.profile);
  const { fromStation, setFromStation } = useRouteStore();

  const [stations,    setStations]    = useState<Station[]>([]);
  const [query,       setQuery]       = useState('');
  const [showList,    setShowList]    = useState(false);
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const [gpsError,    setGpsError]    = useState(false);

  useEffect(() => {
    getStations().then(res => {
      if (res.data) setStations(res.data);
    });
  }, []);

  function detectGPS() {
    if (!navigator.geolocation) { setGpsError(true); return; }
    setGpsLoading(true);
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await getNearestStation(pos.coords.latitude, pos.coords.longitude);
        if (res.data) {
          const annotated = {
            ...res.data,
            distanceKm: Math.round(haversine(pos.coords.latitude, pos.coords.longitude, res.data.lat ?? 0, res.data.lng ?? 0) * 10) / 10,
          };
          setFromStation(annotated);
        }
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); setGpsError(true); },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }

  const filtered = stations.filter(s =>
    !query || s.name.toLowerCase().includes(query.toLowerCase())
  );

  function selectStation(s: Station) {
    setFromStation(s);
    setShowList(false);
    setQuery('');
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      minHeight: '100dvh', background: '#F7F8FA',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top header */}
      <div style={{ padding: '52px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: ER.mute, fontWeight: 500 }}>{greeting}</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>
            {profile?.fullName?.split(' ')[0] ?? 'there'} 👋
          </div>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 99,
          background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
          color: ER.ink, fontWeight: 800, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {profile?.avatarInitials ?? 'ME'}
        </div>
      </div>

      {/* Main card */}
      <div style={{ flex: 1, padding: '0 24px' }}>
        <div style={{
          background: '#fff', borderRadius: 24,
          border: `1px solid ${ER.line}`, boxShadow: ER.cardHi,
          overflow: 'hidden',
        }}>
          {/* Label */}
          <div style={{ padding: '20px 20px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ER.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              You are boarding from
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: ER.ink }}>
              Which metro station?
            </div>
          </div>

          {/* GPS detect */}
          <div style={{ padding: '0 20px 12px' }}>
            <button onClick={detectGPS} disabled={gpsLoading} style={{
              width: '100%', height: 46, borderRadius: 12,
              background: gpsLoading ? ER.bg : ER.greenS,
              border: `1px solid ${ER.green}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13.5, fontWeight: 700, color: gpsLoading ? ER.mute : '#047857',
              cursor: gpsLoading ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>
              <Icon name="pin" size={16} color={gpsLoading ? ER.mute : ER.green}/>
              {gpsLoading ? 'Detecting your location…' : 'Detect my station via GPS'}
            </button>
            {gpsError && (
              <div style={{ fontSize: 11.5, color: ER.red, marginTop: 6, textAlign: 'center' }}>
                GPS not available. Please select manually below.
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 12px' }}>
            <div style={{ flex: 1, height: 1, background: ER.line2 }}/>
            <span style={{ fontSize: 11, color: ER.mute, fontWeight: 600 }}>OR SELECT MANUALLY</span>
            <div style={{ flex: 1, height: 1, background: ER.line2 }}/>
          </div>

          {/* Search box */}
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{
              height: 50, background: ER.bg, borderRadius: 14,
              border: `1px solid ${showList ? ER.green : ER.line}`,
              display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
              transition: 'border-color 0.15s',
            }}>
              <Icon name="search" size={17} color={ER.mute}/>
              <input
                value={fromStation && !showList ? `${fromStation.name} Metro` : query}
                onFocus={() => { setShowList(true); setQuery(''); }}
                onChange={e => { setQuery(e.target.value); setShowList(true); }}
                placeholder="Search stations…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 15, fontFamily: 'inherit',
                  color: fromStation && !showList ? ER.ink : ER.ink,
                  background: 'transparent',
                }}
              />
              {fromStation && !showList && (
                <div style={{ width: 20, height: 20, borderRadius: 99, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={11} color="#fff" strokeWidth={3}/>
                </div>
              )}
            </div>

            {/* Dropdown list */}
            {showList && (
              <div style={{
                marginTop: 8, background: '#fff', borderRadius: 16,
                border: `1px solid ${ER.line}`, boxShadow: ER.cardHi,
                maxHeight: 280, overflowY: 'auto',
              }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: ER.mute, fontSize: 13 }}>No stations found</div>
                ) : filtered.map((s, i) => (
                  <div key={s.id} className="er-tap" onClick={() => selectStation(s)} style={{
                    padding: '13px 16px',
                    borderTop: i === 0 ? 'none' : `1px solid ${ER.line2}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: fromStation?.id === s.id ? ER.greenS : 'transparent',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 99, flexShrink: 0,
                      background: s.line?.includes('Blue') && s.line?.includes('Green')
                        ? 'linear-gradient(135deg, #3B82F6 50%, #10B981 50%)'
                        : s.line?.includes('Green') ? ER.green : ER.blue,
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: 11.5, color: ER.mute, marginTop: 1 }}>{s.line} Line</div>
                    </div>
                    {fromStation?.id === s.id && (
                      <Icon name="check" size={14} color={ER.green} strokeWidth={2.5}/>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected station preview */}
        {fromStation && (
          <div style={{
            marginTop: 14, padding: '14px 16px', borderRadius: 16,
            background: ER.ink, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="train" size={20} color="#fff"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Starting from</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{fromStation.name} Metro</div>
            </div>
            <button onClick={() => { setFromStation(null as any); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: 4 }}>
              <Icon name="x" size={16} color="#fff"/>
            </button>
          </div>
        )}
      </div>

      {/* Continue button */}
      <div style={{ padding: '20px 24px 40px' }}>
        <button
          onClick={() => fromStation && router.push('/destination')}
          disabled={!fromStation}
          style={{
            width: '100%', height: 56, borderRadius: 16,
            background: fromStation ? ER.green : ER.line,
            color: fromStation ? '#062B1F' : ER.mute,
            fontSize: 16, fontWeight: 700, border: 'none',
            cursor: fromStation ? 'pointer' : 'default',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: fromStation ? '0 8px 24px rgba(16,185,129,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          Continue to Destination
          <Icon name="arrow" size={20} color={fromStation ? '#062B1F' : ER.mute} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}
