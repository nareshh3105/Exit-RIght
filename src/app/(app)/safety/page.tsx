'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { MapBg } from '@/components/map/MapBg';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import { getSafetyScore } from '@/lib/api/safety';
import type { SafetyFactor } from '@/types';

const FALLBACK_TILES = [
  { tone: 'good' as const, icon: 'sun'   as const, label: 'Well-lit street',  detail: 'CCTV every 80m'       },
  { tone: 'good' as const, icon: 'crowd' as const, label: 'Crowded route',    detail: 'Active foot traffic'  },
  { tone: 'bad'  as const, icon: 'walk'  as const, label: 'Walking unsafe',   detail: 'Avoid service road'   },
  { tone: 'good' as const, icon: 'cab'   as const, label: 'Verified driver',  detail: 'Partner verified'     },
];

export default function SafetyPage() {
  const router = useRouter();
  const { fromStation, recommendation, toLat, toLng } = useRouteStore();
  const [safetyTiles, setSafetyTiles] = useState(FALLBACK_TILES);
  const [overallScore, setOverallScore] = useState(9);

  useEffect(() => {
    async function load() {
      if (!fromStation?.id) return;
      const gateNum = recommendation?.gateRecommendation?.recommendedGate ?? 2;
      const res = await getSafetyScore({
        stationId: fromStation.id,
        gateNumber: gateNum,
        mode: 'cab',
        destinationLat: toLat ?? 12.9916,
        destinationLng: toLng ?? 80.2146,
      });
      if (res.data) {
        setOverallScore(Math.round(res.data.overallScore));
        setSafetyTiles(res.data.factors.map((f: SafetyFactor) => ({
          tone: f.tone as 'good' | 'bad',
          icon: f.icon as any,
          label: f.label,
          detail: f.tone === 'good' ? 'Verified safe' : 'Use caution',
        })));
      }
    }
    load();
  }, [fromStation?.id, recommendation, toLat, toLng]);
  return (
    <div style={{ background: ER.nightBg, minHeight: '100dvh', color: ER.nightInk }}>
      {/* Night map */}
      <div style={{ position: 'relative', height: 230 }}>
        <MapBg dark height={230}>
          {/* Well-lit gate */}
          <div style={{ position: 'absolute', left: 55, top: 90 }}>
            <div style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.95)', fontSize: 9, fontWeight: 800, color: '#062B1F', marginBottom: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>Well-lit · Gate 2</div>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: ER.green, border: '2px solid #fff', boxShadow: '0 0 0 6px rgba(16,185,129,0.2), 0 0 20px rgba(16,185,129,0.5)', margin: '0 auto' }}/>
          </div>
          {/* Avoid gate */}
          <div style={{ position: 'absolute', right: 55, top: 65 }}>
            <div style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.9)', fontSize: 9, fontWeight: 800, color: '#fff', marginBottom: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>Avoid · Gate 4</div>
            <div style={{ width: 20, height: 20, borderRadius: 99, border: `2px dashed ${ER.red}`, margin: '0 auto' }}/>
          </div>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M79 114 Q 150 140, 240 185" stroke={ER.green} strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M79 114 Q 150 140, 240 185" stroke={ER.green} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.15"/>
          </svg>
          {/* Time pill */}
          <div style={{ position: 'absolute', top: 48, right: 16, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="moon" size={12} color="#FBBF24"/>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ position: 'absolute', top: 44, left: 12 }}><BackBtn dark/></div>
        </MapBg>
      </div>

      {/* Bottom sheet */}
      <div style={{ background: ER.nightSurf, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '14px 18px 32px', marginTop: -8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }}/>
        </div>

        {/* Safety banner */}
        <div style={{ padding: 14, borderRadius: 18, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="shield" size={20} color="#062B1F" strokeWidth={2.5}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: ER.green, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Safety mode · on</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Safer route recommended</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.4 }}>
              Gate 2 → crowded main road → verified cab. Adds <strong style={{ color: '#fff' }}>4 min</strong>, raises safety <strong style={{ color: ER.green }}>4 → 9</strong>.
            </div>
          </div>
        </div>

        {/* Safety tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {safetyTiles.map((t, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.tone === 'good' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: `${t.tone === 'good' ? ER.green : ER.red}26`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={t.icon} size={14} color={t.tone === 'good' ? ER.green : ER.red}/>
                </div>
                <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: t.tone === 'good' ? ER.green : ER.red }}>{t.tone === 'good' ? 'Pro' : 'Con'}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{t.detail}</div>
            </div>
          ))}
        </div>

        {/* Book cab CTA */}
        <div className="er-tap" onClick={() => router.push('/cabs')} style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: ER.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cab" size={22} color="#062B1F" strokeWidth={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Book verified cab</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>₹148 · 14 min · share trip with Priya</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: ER.green, color: '#062B1F', fontSize: 13, fontWeight: 700 }}>Go</div>
        </div>

        {/* Trip share */}
        <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="user" size={16} color="rgba(255,255,255,0.7)"/>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', flex: 1 }}>
            Live trip shared with <strong style={{ color: '#fff' }}>Priya R.</strong> & <strong style={{ color: '#fff' }}>Mom</strong>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: ER.green }}>EDIT</div>
        </div>
      </div>
    </div>
  );
}
