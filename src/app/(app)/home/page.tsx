'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouteStore } from '@/store/useRouteStore';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import { getSavedRoutes } from '@/lib/api/saved';
import { getTripHistory } from '@/lib/api/trips';
import { getWeather } from '@/lib/api/weather';
import { getStations, getNearestStation } from '@/lib/api/stations';
import type { SavedRoute, TripHistory, WeatherData, Station } from '@/types';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomePage() {
  const router  = useRouter();
  const profile = useAuthStore(s => s.profile);
  const { fromStation, setFromStation } = useRouteStore();

  const [allStations,  setAllStations]  = useState<Station[]>([]);
  const [savedRoutes,  setSavedRoutes]  = useState<SavedRoute[]>([]);
  const [recentTrips,  setRecentTrips]  = useState<TripHistory[]>([]);
  const [weather,      setWeather]      = useState<WeatherData | null>(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [query,        setQuery]        = useState('');
  const [gpsLoading,   setGpsLoading]   = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load stations + GPS auto-detect
  useEffect(() => {
    async function init() {
      const [stRes] = await Promise.all([getStations()]);
      if (!stRes.data) return;
      const stations = stRes.data;
      setAllStations(stations);

      // Auto-detect nearest station via GPS
      if (navigator.geolocation) {
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const nearRes = await getNearestStation(pos.coords.latitude, pos.coords.longitude);
            if (nearRes.data && !fromStation) {
              setFromStation(nearRes.data);
            }
            // Annotate distances
            const annotated = stations.map(s => ({
              ...s,
              distanceKm: s.lat && s.lng
                ? Math.round(haversine(pos.coords.latitude, pos.coords.longitude, s.lat, s.lng) * 10) / 10
                : undefined,
              isNearest: nearRes.data ? s.id === nearRes.data.id : false,
            }));
            setAllStations(annotated);
            setGpsLoading(false);
          },
          () => setGpsLoading(false),
          { timeout: 5000 },
        );
      }
    }
    init();
  }, []);

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!profile?.id) return;
      const [savedRes, tripsRes] = await Promise.all([
        getSavedRoutes(profile.id),
        getTripHistory(profile.id, 1, 3),
      ]);
      if (savedRes.data) setSavedRoutes(savedRes.data);
      if (tripsRes.data) setRecentTrips(tripsRes.data.data);

      if (fromStation?.id) {
        const weatherRes = await getWeather(fromStation.id);
        if (weatherRes.data) setWeather(weatherRes.data);
      }
    }
    loadUserData();
  }, [profile?.id, fromStation?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const filteredStations = allStations.filter(s =>
    !query || s.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleStationSelect(station: Station) {
    setFromStation(station);
    setShowPicker(false);
    setQuery('');
  }

  function handleFindExit() {
    if (!fromStation) {
      setShowPicker(true);
      return;
    }
    router.push('/destination');
  }

  return (
    <div style={{ paddingTop: 52, paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: ER.mute, fontWeight: 500 }}>{greeting}, {profile?.fullName?.split(' ')[0] ?? 'there'}</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, marginTop: 2 }}>Plan your commute</div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 99,
          background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
          color: ER.ink, fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {profile?.avatarInitials ?? 'ME'}
        </div>
      </div>

      {/* Station + Destination selector card */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 22, border: `1px solid ${ER.line}`, boxShadow: ER.card, overflow: 'hidden' }}>

          {/* Step 1: You are at */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${ER.line2}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ER.mute, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
              You are at
            </div>
            <div className="er-tap" onClick={() => setShowPicker(true)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              background: fromStation ? ER.greenS : ER.bg,
              border: `1px solid ${fromStation ? ER.green + '40' : ER.line}`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: fromStation ? ER.green : ER.mute2, flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: fromStation ? ER.ink : ER.mute }}>
                {gpsLoading ? 'Detecting your station…' : fromStation ? `${fromStation.name} Metro` : 'Select your station'}
              </span>
              <Icon name="chevD" size={16} color={ER.mute}/>
            </div>
          </div>

          {/* Step 2: Going to */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ER.mute, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
              Going to
            </div>
            <div className="er-tap" onClick={handleFindExit} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              background: ER.bg, border: `1px solid ${ER.line}`,
            }}>
              <span style={{ width: 8, height: 8, background: ER.green, flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 15, color: ER.mute }}>Where are you going?</span>
              <Icon name="search" size={16} color={ER.mute}/>
            </div>
          </div>
        </div>

        {/* Find Best Exit CTA */}
        <button onClick={handleFindExit} style={{
          width: '100%', marginTop: 10, height: 52, borderRadius: 14,
          background: fromStation ? ER.green : ER.line,
          color: fromStation ? '#062B1F' : ER.mute,
          fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: fromStation ? '0 8px 18px rgba(16,185,129,0.3)' : 'none',
          transition: 'all 0.2s ease',
        }}>
          Find Best Exit
          <Icon name="arrow" size={18} color={fromStation ? '#062B1F' : ER.mute} strokeWidth={2.5}/>
        </button>
      </div>

      {/* Weather alerts */}
      {weather && weather.rainProbability > 30 && (
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 12, border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ER.amberS, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="rain" size={18} color={ER.amber}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Rain likely — {weather.rainProbability}% chance</div>
              <div style={{ fontSize: 12, color: ER.mute }}>Prefer covered exits and cab today.</div>
            </div>
          </div>
        </div>
      )}

      {/* Saved routes */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: ER.mute }}>Saved routes</div>
        <div className="er-tap" onClick={() => router.push('/saved')} style={{ fontSize: 12, fontWeight: 600, color: ER.ink2 }}>See all</div>
      </div>

      {savedRoutes.length === 0 ? (
        <div style={{ padding: '0 20px' }}>
          <div className="er-tap" onClick={() => router.push('/saved')} style={{ padding: '14px', borderRadius: 14, background: '#fff', border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="plus" size={16} color={ER.mute}/>
            <div style={{ fontSize: 13, color: ER.mute }}>Save your frequent destinations</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto' }}>
          {savedRoutes.map(r => (
            <div key={r.id} className="er-tap" onClick={() => router.push('/destination')} style={{ minWidth: 130, padding: 14, borderRadius: 16, background: '#fff', border: `1px solid ${ER.line}`, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: (r.color || ER.green) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon name={(r.icon || 'pin') as any} size={14} color={r.color || ER.green}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: ER.mute, marginTop: 2 }}>{r.estimatedEta}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent trips */}
      {recentTrips.length > 0 && (
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: ER.mute, marginBottom: 10 }}>Recent</div>
          {recentTrips.map((t, i) => (
            <div key={t.id} className="er-tap" onClick={() => router.push('/destination')} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: i < recentTrips.length - 1 ? `1px solid ${ER.line2}` : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: ER.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="swap" size={16} color={ER.ink3}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.fromStation} → {t.toDestination}</div>
                <div style={{ fontSize: 12, color: ER.mute, marginTop: 1 }}>
                  {t.modeUsed} · ₹{t.actualCost}
                </div>
              </div>
              <div style={{ padding: '5px 10px', borderRadius: 8, background: ER.bg, fontSize: 12, fontWeight: 600 }}>Repeat</div>
            </div>
          ))}
        </div>
      )}

      {/* Station Picker Bottom Sheet */}
      {showPicker && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowPicker(false); }}>
          <div ref={pickerRef} style={{
            background: '#F7F8FA', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: '85dvh', display: 'flex', flexDirection: 'column',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: ER.line }}/>
            </div>

            {/* Title */}
            <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Select your station</div>
              <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Icon name="x" size={20} color={ER.ink2}/>
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '0 20px 12px' }}>
              <div style={{ height: 46, background: '#fff', borderRadius: 14, border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
                <Icon name="search" size={16} color={ER.mute}/>
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search stations…"
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: ER.ink, background: 'transparent' }}
                />
                {query && <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Icon name="x" size={14} color={ER.mute}/></button>}
              </div>
            </div>

            {/* Station list */}
            <div style={{ overflowY: 'auto', padding: '0 20px 32px' }}>
              <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${ER.line}`, overflow: 'hidden' }}>
                {filteredStations.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: ER.mute, fontSize: 13 }}>No stations found</div>
                ) : filteredStations.map((s, i) => (
                  <div key={s.id} className="er-tap" onClick={() => handleStationSelect(s)} style={{
                    padding: '13px 14px',
                    borderTop: i === 0 ? 'none' : `1px solid ${ER.line2}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: fromStation?.id === s.id ? ER.greenS : s.isNearest ? 'rgba(16,185,129,0.04)' : 'transparent',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: ER.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="train" size={14} color={ER.blue}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {s.name}
                        {s.isNearest && <span style={{ marginLeft: 8, fontSize: 9, padding: '2px 6px', borderRadius: 4, background: ER.green, color: '#fff', fontWeight: 700, verticalAlign: 'middle' }}>NEAREST</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: ER.mute, marginTop: 1 }}>
                        {s.line} Line{s.distanceKm != null ? ` · ${s.distanceKm} km away` : ''}
                      </div>
                    </div>
                    {fromStation?.id === s.id
                      ? <div style={{ width: 20, height: 20, borderRadius: 99, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={11} color="#fff" strokeWidth={3}/></div>
                      : <Icon name="chev" size={14} color={ER.mute}/>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
