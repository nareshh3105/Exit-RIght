'use client';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { CrowdMeter } from '@/components/ui/CrowdMeter';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import type { CrowdLevel } from '@/types';

export default function ComparePage() {
  const router = useRouter();
  const { recommendation, toDestination } = useRouteStore();

  const options = recommendation?.transportOptions ?? [];
  const gateNum  = recommendation?.gateRecommendation?.recommendedGate ?? '—';
  const destName = toDestination || 'Destination';
  const aiTake   = recommendation?.aiTake ?? '';

  if (options.length === 0) {
    return (
      <div style={{ padding: '52px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <BackBtn />
          <div style={{ fontSize: 18, fontWeight: 700 }}>Compare all</div>
        </div>
        <div style={{ textAlign: 'center', color: ER.mute, fontSize: 14, paddingTop: 40 }}>
          No route data yet. Start from the home screen.
        </div>
      </div>
    );
  }

  const MODES = options.map(o => ({
    mode: o.mode as 'cab' | 'auto' | 'bus' | 'walk',
    name: o.name,
    eta: o.eta,
    best: o.isRecommended ?? false,
    avoid: o.shouldAvoid ?? false,
  }));

  const ROWS = [
    { label: 'Time',    values: options.map(o => o.eta),                                          best: 0 },
    { label: 'Cost',    values: options.map(o => o.cost),                                         best: options.findIndex(o => o.isCheapest) },
    { label: 'Comfort', values: options.map((_, i) => [5,3,2,2][i] ?? 2), type: 'bars'  as const },
    { label: 'Safety',  values: options.map(o => o.safetyScore),           type: 'bars'  as const },
    { label: 'Crowd',   values: options.map(o => o.crowdLevel),            type: 'crowd' as const },
    { label: 'Weather', values: options.map(o => o.safetyScore >= 6 ? 'OK' : '⚠︎'), type: 'text' as const },
  ];

  return (
    <div>
      <div style={{ padding: '52px 20px 14px', borderBottom: `1px solid ${ER.line}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackBtn />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>Gate {gateNum} → {destName}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Compare all</div>
          </div>
        </div>
      </div>

      {/* Mode headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr', padding: '12px 12px 0', gap: 6 }}>
        <div/>
        {MODES.map(m => (
          <div key={m.mode} className="er-tap" onClick={() => m.mode === 'cab' && router.push('/cabs')} style={{
            padding: '10px 4px', borderRadius: 14,
            background: m.best ? ER.greenS : m.avoid ? ER.redS : '#fff',
            border: m.best ? `1.5px solid ${ER.green}` : `1px solid ${ER.line}`,
            textAlign: 'center', opacity: m.avoid ? 0.72 : 1, position: 'relative',
          }}>
            {m.best && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', padding: '2px 5px', background: ER.green, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 4 }}>BEST</div>}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
              <Icon name={m.mode} size={18} color={m.best ? ER.green : m.avoid ? ER.red : ER.ink2}/>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: ER.ink }}>{m.name}</div>
            <div style={{ fontSize: 9, color: ER.mute, marginTop: 1 }}>{m.eta}</div>
          </div>
        ))}
      </div>

      {/* Comparison rows */}
      <div style={{ padding: '12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${ER.line}`, overflow: 'hidden' }}>
          {ROWS.map((row, ri) => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr',
              alignItems: 'center', padding: '12px 10px', gap: 4,
              borderTop: ri === 0 ? 'none' : `1px solid ${ER.line2}`,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: ER.mute, letterSpacing: 0.3, textTransform: 'uppercase' }}>{row.label}</div>
              {row.values.map((v, vi) => (
                <div key={vi} style={{ textAlign: 'center' }}>
                  {row.type === 'bars' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: 32, height: 4, borderRadius: 99, background: ER.line, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99, width: `${(v as number)*10}%`, background: (v as number)>=7?ER.green:(v as number)>=5?ER.amber:ER.red }}/>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: (v as number)>=7?ER.green:(v as number)>=5?ER.amber:ER.red }}>{v}</span>
                    </div>
                  ) : row.type === 'crowd' ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}><CrowdMeter level={v as CrowdLevel}/></div>
                  ) : row.type === 'text' ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: ER.ink2 }}>{v}</span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: row.best === vi ? ER.green : ER.ink }}>{v}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI take */}
        {aiTake && (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 16, background: ER.ink, color: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, flexShrink: 0, background: 'rgba(16,185,129,0.2)', border: `1px solid ${ER.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={14} color={ER.green}/>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 3 }}>Our take</div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>{aiTake}</div>
            </div>
          </div>
        )}

        <button onClick={() => router.push('/cabs')} style={{
          width: '100%', marginTop: 12, height: 54, borderRadius: 14, background: ER.green, color: '#062B1F',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 20px rgba(16,185,129,0.28)',
        }}>
          Book a cab <Icon name="arrow" size={18} color="#062B1F"/>
        </button>
      </div>
    </div>
  );
}
