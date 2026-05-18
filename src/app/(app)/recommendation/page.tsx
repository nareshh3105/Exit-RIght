'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { MapBg } from '@/components/map/MapBg';
import { CrowdMeter } from '@/components/ui/CrowdMeter';
import { Icon } from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import ErrorCard from '@/components/ui/ErrorCard';
import { ER } from '@/lib/tokens';
import { getRecommendation } from '@/lib/api/routes';
import type { TransportMode, CrowdLevel, TransportOption } from '@/types';

const FALLBACK_MODES = [
  { mode: 'cab'  as TransportMode, name: 'Cab',         eta: '14 min', cost: '₹148', crowd: 1 as CrowdLevel, safety: 9, conf: 92, best: true,  route: '/cabs'    },
  { mode: 'auto' as TransportMode, name: 'Shared Auto', eta: '22 min', cost: '₹35',  crowd: 2 as CrowdLevel, safety: 7, conf: 74, cheapest: true, route: '/compare' },
  { mode: 'bus'  as TransportMode, name: 'Bus 21G',     eta: '28 min', cost: '₹18',  crowd: 3 as CrowdLevel, safety: 6, conf: 58, route: '/compare' },
  { mode: 'walk' as TransportMode, name: 'Walking',     eta: '1h 12m', cost: 'Free', crowd: 0 as CrowdLevel, safety: 4, conf: 22, avoid: true, route: '/compare' },
];

function RMini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ height: 13, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{ fontSize: 10.5, color: ER.mute, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function RecommendationPage() {
  const router = useRouter();
  const { fromStation, toDestination, toLat, toLng, setRecommendation } = useRouteStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recGate, setRecGate] = useState(2);
  const [gateReasons, setGateReasons] = useState<string[]>(['Closest to destination', 'Less crowded', 'Covered walkway']);
  const [altGates, setAltGates] = useState<Array<{n: number; w: string; t: string}>>([
    {n: 1, w: '+ 3 min', t: 'ok'}, {n: 3, w: 'Crowded', t: 'bad'}, {n: 4, w: '+ 7 min', t: 'bad'}
  ]);
  const [MODES, setMODES] = useState(FALLBACK_MODES);

  useEffect(() => {
    async function load() {
      if (!fromStation?.id) { setLoading(false); return; }
      setLoading(true);
      setError(null);

      const res = await getRecommendation(fromStation.id, toDestination || 'Destination', toLat ?? undefined, toLng ?? undefined);

      if (res.data) {
        setRecommendation(res.data);
        const gr = res.data.gateRecommendation;
        setRecGate(gr.recommendedGate);
        setGateReasons(gr.reasons);
        setAltGates(gr.alternateGates.map(g => ({
          n: g.gate,
          w: g.extraTime || (g.status === 'bad' ? 'Avoid' : 'OK'),
          t: g.status,
        })));

        const modes = res.data.transportOptions.map(o => ({
          mode: o.mode as TransportMode,
          name: o.name,
          eta: o.eta,
          cost: o.cost,
          crowd: Math.min(3, Math.max(0, o.crowdLevel)) as CrowdLevel,
          safety: o.safetyScore,
          conf: o.confidencePercent,
          best: o.isRecommended ?? false,
          cheapest: o.isCheapest ?? false,
          avoid: o.shouldAvoid ?? false,
          route: o.mode === 'cab' ? '/cabs' : '/compare',
        }));
        if (modes.length > 0) setMODES(modes);
      } else {
        setError(res.error || 'Failed to load recommendation');
      }
      setLoading(false);
    }
    load();
  }, [fromStation?.id, toDestination, toLat, toLng, setRecommendation]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton height={240} borderRadius={0} />
        <Skeleton height={80} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    );
  }

  return (
    <div>
      {/* Map */}
      <div style={{ position: 'relative', height: 240 }}>
        <MapBg height={240}>
          <div style={{
            position: 'absolute', left: 68, top: 80, width: 190, height: 80, borderRadius: 16,
            background: 'rgba(15,23,42,0.92)', color: '#fff', border: '2px solid rgba(16,185,129,0.5)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: ER.cardHi,
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
              {fromStation?.name ?? 'Guindy'} Metro
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>Concourse Level</div>
            {[{n:1,pos:{left:20,top:-12}},{n:2,pos:{right:20,top:-12},h:true},{n:3,pos:{left:20,bottom:-12}},{n:4,pos:{right:20,bottom:-12}}].map((g: any) => (
              <div key={g.n} style={{
                position: 'absolute', ...g.pos,
                width: 24, height: 24, borderRadius: 99,
                background: g.h ? ER.green : '#fff', color: g.h ? '#fff' : ER.ink,
                fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: g.h ? '0 0 0 4px rgba(16,185,129,0.25)' : '0 2px 6px rgba(0,0,0,0.15)',
              }}>{g.n}</div>
            ))}
          </div>
          <div style={{ position: 'absolute', right: 24, top: 40 }}>
            <div style={{ padding: '4px 8px', borderRadius: 6, background: '#fff', fontSize: 10, fontWeight: 700, color: ER.ink, boxShadow: ER.card, marginBottom: 3, textAlign: 'center' }}>
              {toDestination || 'Phoenix'} · 14m
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: ER.green, border: '2px solid #fff', boxShadow: '0 3px 10px rgba(16,185,129,0.45)', margin: '0 auto' }}/>
          </div>
          <div style={{ position: 'absolute', top: 48, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BackBtn />
            <div style={{ flex: 1, height: 34, background: 'rgba(255,255,255,0.95)', borderRadius: 17, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 7, boxShadow: ER.card }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: ER.blue }}/>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{fromStation?.name ?? 'Guindy'}</span>
              <Icon name="arrow" size={11} color={ER.mute}/>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: ER.green }}/>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{toDestination || 'Phoenix'}</span>
            </div>
            <div className="er-tap" onClick={() => router.push('/safety')} style={{ width: 34, height: 34, borderRadius: 99, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: ER.card }}>
              <Icon name="moon" size={16} color={ER.ink2}/>
            </div>
          </div>
        </MapBg>
      </div>

      {/* Bottom sheet */}
      <div style={{ background: ER.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -8, paddingBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: ER.line }}/>
        </div>

        {/* Gate hero */}
        <div style={{ padding: '0 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="bolt" size={13} color={ER.green}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: ER.green, letterSpacing: 1, textTransform: 'uppercase' }}>Recommended exit</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 14, border: `1px solid ${ER.line}`, boxShadow: ER.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: `linear-gradient(140deg, ${ER.green}, #059669)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 18px rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}>GATE</div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{recGate}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Take Exit Gate {recGate}</div>
              <div style={{ fontSize: 12, color: ER.mute, lineHeight: 1.45, marginTop: 4 }}>{gateReasons.join(' · ')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {altGates.map(g => (
              <div key={g.n} style={{ flex: 1, padding: '8px 10px', borderRadius: 12, background: '#fff', border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: ER.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{g.n}</div>
                <div>
                  <div style={{ fontSize: 9.5, color: ER.mute }}>Gate {g.n}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: g.t === 'bad' ? ER.red : ER.amber }}>{g.w}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport options */}
        <div style={{ padding: '0 18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>Last-mile options</div>
            <div className="er-tap" onClick={() => router.push('/compare')} style={{ fontSize: 12, color: ER.ink2, fontWeight: 600 }}>Compare all →</div>
          </div>
          {MODES.map(m => {
            const accent = m.avoid ? ER.red : m.best ? ER.green : ER.ink;
            const bg2    = m.avoid ? ER.redS : m.best ? ER.greenS : '#fff';
            const safetyC = m.safety >= 8 ? ER.green : m.safety >= 6 ? ER.amber : ER.red;
            return (
              <div key={m.mode} className="er-tap" onClick={() => router.push(m.route)} style={{
                background: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
                border: m.best ? `1.5px solid ${ER.green}` : `1px solid ${ER.line}`,
                boxShadow: m.best ? '0 6px 20px rgba(16,185,129,0.12)' : ER.card,
                position: 'relative', opacity: m.avoid ? 0.78 : 1,
              }}>
                {(m.best || m.cheapest) && (
                  <div style={{ position: 'absolute', right: -1, top: -1, padding: '4px 10px', background: m.best ? ER.green : ER.ink, color: '#fff', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderBottomLeftRadius: 11, borderTopRightRadius: 17 }}>
                    {m.best ? 'Recommended' : 'Cheapest'}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.mode} size={22} color={accent}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: ER.mute, marginTop: 1 }}>{m.eta} · 6.2 km</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{m.cost}</div>
                    <div style={{ fontSize: 10, color: ER.mute, fontFamily: 'monospace' }}>est.</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, paddingTop: 10, borderTop: `1px solid ${ER.line2}` }}>
                  <RMini icon={<CrowdMeter level={m.crowd}/>} label={['Empty','Light','Mod.','Heavy'][m.crowd]}/>
                  <RMini icon={<Icon name="rain" size={13} color={ER.blue}/>} label="Wet"/>
                  <RMini icon={<Icon name="shield" size={13} color={safetyC}/>} label={`${m.safety}/10`}/>
                  <RMini icon={<div style={{ width: 28, height: 4, borderRadius: 99, background: ER.line, position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99, width: `${m.conf}%`, background: accent }}/></div>} label={`${m.conf}%`}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
