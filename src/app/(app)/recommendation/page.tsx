'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import { getRecommendation } from '@/lib/api/routes';
import type { TransportMode, CrowdLevel } from '@/types';

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const MODE_META: Record<string, { icon: TransportMode; color: string; bg: string }> = {
  cab:  { icon: 'cab',  color: ER.ink,   bg: '#F8F9FA' },
  auto: { icon: 'auto', color: ER.amber, bg: '#FFFBEB' },
  bus:  { icon: 'bus',  color: ER.blue,  bg: '#EFF6FF' },
  walk: { icon: 'walk', color: ER.mute,  bg: '#F8F9FA' },
};

export default function RecommendationPage() {
  const router = useRouter();
  const { fromStation, toDestination, toLat, toLng, setRecommendation } = useRouteStore();

  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [recGate,     setRecGate]     = useState(0);
  const [gateReasons, setGateReasons] = useState<string[]>([]);
  const [altGates,    setAltGates]    = useState<Array<{ n: number; w: string; bad: boolean }>>([]);
  const [MODES,       setMODES]       = useState<Array<{
    mode: TransportMode; name: string; eta: string; cost: string;
    crowd: CrowdLevel; safety: number; conf: number;
    best: boolean; cheapest: boolean; avoid: boolean;
  }>>([]);

  const [hasExited,   setHasExited]   = useState(false);
  const [distFromSt,  setDistFromSt]  = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Load recommendation data
  useEffect(() => {
    async function load() {
      if (!fromStation?.id) { setLoading(false); return; }
      setLoading(true); setError(null);
      const res = await getRecommendation(fromStation.id, toDestination || 'Destination', toLat ?? undefined, toLng ?? undefined);
      if (res.data) {
        setRecommendation(res.data);
        const gr = res.data.gateRecommendation;
        setRecGate(gr.recommendedGate);
        setGateReasons(gr.reasons);
        setAltGates(gr.alternateGates.map(g => ({
          n: g.gate,
          w: g.extraTime || (g.status === 'bad' ? 'Crowded' : 'OK'),
          bad: g.status === 'bad',
        })));
        const modes = res.data.transportOptions.map(o => ({
          mode: o.mode as TransportMode,
          name: o.name, eta: o.eta, cost: o.cost,
          crowd: Math.min(3, Math.max(0, o.crowdLevel)) as CrowdLevel,
          safety: o.safetyScore, conf: o.confidencePercent,
          best: o.isRecommended ?? false,
          cheapest: o.isCheapest ?? false,
          avoid: o.shouldAvoid ?? false,
        }));
        if (modes.length > 0) setMODES(modes);
      } else {
        setError(res.error || 'Failed to load recommendation');
      }
      setLoading(false);
    }
    load();
  }, [fromStation?.id, toDestination, toLat, toLng, setRecommendation]);

  // GPS: watch for metro exit (>200m from station)
  useEffect(() => {
    if (!fromStation?.lat || !fromStation?.lng || !navigator.geolocation) return;
    const sLat = fromStation.lat, sLng = fromStation.lng;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const d = haversineM(pos.coords.latitude, pos.coords.longitude, sLat, sLng);
        setDistFromSt(Math.round(d));
        if (d > 200) setHasExited(true);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current!); };
  }, [fromStation?.lat, fromStation?.lng]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 99, background: ER.greenS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bolt" size={24} color={ER.green}/>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Finding best exit…</div>
        <div style={{ fontSize: 13, color: ER.mute, textAlign: 'center', lineHeight: 1.5 }}>
          Analysing crowd levels, gate directions and live traffic
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 99, background: ER.green,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}/>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: ER.red, textAlign: 'center' }}>{error}</div>
        <button onClick={() => router.back()} style={{ padding: '12px 24px', borderRadius: 12, background: ER.ink, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
          Go back
        </button>
      </div>
    );
  }

  // ── PHASE 2: Exited metro → Show transport options ──────────────────
  if (hasExited && MODES.length > 0) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '52px 20px 16px', background: ER.green }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button onClick={() => setHasExited(false)} style={{ width: 36, height: 36, borderRadius: 99, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, textTransform: 'uppercase' }}>You've exited the metro</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginTop: 2 }}>Choose your ride</div>
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>To {toDestination || 'Destination'}</span>
            </div>
          </div>
        </div>

        {/* Transport cards */}
        <div style={{ flex: 1, padding: '16px 20px 32px', overflowY: 'auto' }}>
          {MODES.map((m) => {
            const meta = MODE_META[m.mode] ?? MODE_META.cab;
            const safetyColor = m.safety >= 8 ? ER.green : m.safety >= 6 ? ER.amber : ER.red;
            return (
              <div key={m.mode} className="er-tap" onClick={() => m.mode === 'cab' ? router.push('/cabs') : router.push('/compare')} style={{
                background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12,
                border: m.best ? `2px solid ${ER.green}` : `1px solid ${ER.line}`,
                boxShadow: m.best ? '0 8px 24px rgba(16,185,129,0.15)' : ER.card,
                opacity: m.avoid ? 0.6 : 1,
                position: 'relative',
              }}>
                {m.best && (
                  <div style={{ position: 'absolute', top: -1, right: -1, padding: '5px 12px', background: ER.green, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderTopRightRadius: 18, borderBottomLeftRadius: 12 }}>
                    Best Choice
                  </div>
                )}
                {m.cheapest && !m.best && (
                  <div style={{ position: 'absolute', top: -1, right: -1, padding: '5px 12px', background: ER.amber, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderTopRightRadius: 18, borderBottomLeftRadius: 12 }}>
                    Cheapest
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={meta.icon} size={26} color={m.avoid ? ER.red : meta.color}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: ER.mute, marginTop: 3 }}>{m.eta} · to {toDestination || 'destination'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{m.cost}</div>
                    <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600 }}>estimated</div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${ER.line2}` }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Safety</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: safetyColor, marginTop: 2 }}>{m.safety}/10</div>
                  </div>
                  <div style={{ width: 1, background: ER.line2 }}/>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Time</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ER.ink, marginTop: 2 }}>{m.eta}</div>
                  </div>
                  <div style={{ width: 1, background: ER.line2 }}/>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Score</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ER.green, marginTop: 2 }}>{m.conf}%</div>
                  </div>
                </div>

                {m.avoid && (
                  <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 8, background: ER.redS, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="info" size={12} color={ER.red}/>
                    <span style={{ fontSize: 11.5, color: ER.red, fontWeight: 600 }}>Not recommended at this time</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── PHASE 1: In metro → Show gate recommendation ────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px', background: ER.ink, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 99, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {fromStation?.name ?? 'Metro'} → {toDestination || 'Destination'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>Best Exit Gate</div>
          </div>
        </div>

        {/* GPS tracker */}
        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: ER.green, boxShadow: '0 0 0 3px rgba(16,185,129,0.3)' }}/>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: ER.green, flex: 1 }}>
            {distFromSt != null
              ? `Tracking location · ${distFromSt}m from station`
              : 'Tracking your location…'}
          </span>
          <button onClick={() => setHasExited(true)} style={{ fontSize: 11, fontWeight: 700, color: ER.green, background: 'rgba(16,185,129,0.2)', border: 'none', padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }}>
            I've exited
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 32px', overflowY: 'auto' }}>

        {/* Recommended gate */}
        {recGate > 0 ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: ER.mute, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>AI Recommendation</div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, border: `2px solid ${ER.green}`, boxShadow: '0 8px 24px rgba(16,185,129,0.15)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 70, height: 70, borderRadius: 18,
                  background: `linear-gradient(140deg, ${ER.green}, #059669)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', boxShadow: '0 8px 20px rgba(16,185,129,0.4)', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, letterSpacing: 0.5 }}>GATE</div>
                  <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{recGate}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Icon name="bolt" size={14} color={ER.green}/>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ER.green, letterSpacing: 0.5, textTransform: 'uppercase' }}>Recommended Exit</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Take Gate {recGate}</div>
                  {gateReasons.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {gateReasons.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: 99, background: ER.green, flexShrink: 0 }}/>
                          <span style={{ fontSize: 12.5, color: ER.ink2, fontWeight: 500 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Other gates */}
            {altGates.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: ER.mute, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Other gates</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {altGates.map(g => (
                    <div key={g.n} style={{ flex: 1, padding: '12px', borderRadius: 14, background: '#fff', border: `1px solid ${ER.line}` }}>
                      <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600, marginBottom: 4 }}>Gate {g.n}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: g.bad ? ER.red : ER.amber }}>{g.w}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ padding: '32px 0', textAlign: 'center', color: ER.mute, fontSize: 14 }}>
            No gate data available for this station yet.
          </div>
        )}

        {/* Waiting for exit info card */}
        <div style={{ padding: '16px', borderRadius: 16, background: ER.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(16,185,129,0.2)', border: `1px solid ${ER.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="pin" size={18} color={ER.green}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Transport options ready after exit</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 3, lineHeight: 1.4 }}>
              We'll automatically show cab, auto, bus and walk options the moment you exit the station.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
