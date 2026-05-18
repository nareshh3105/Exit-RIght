'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { Pill } from '@/components/ui/Pill';
import { Icon } from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import { ER } from '@/lib/tokens';
import { getCabProviders } from '@/lib/api/routes';
import type { CabProvider } from '@/types';

const SORT_OPTIONS = ['Recommended', 'Cheapest', 'Fastest', 'Rated'] as const;

export default function CabsPage() {
  const router = useRouter();
  const { recommendation, toLat, toLng, toDestination, setCabProviders } = useRouteStore();
  const [cabs, setCabs] = useState<CabProvider[]>([]);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Recommended');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const pickupLat = toLat ?? 12.9766;
      const pickupLng = toLng ?? 80.2207;
      const dropLat   = toLat ?? 12.9916;
      const dropLng   = toLng ?? 80.2146;

      const res = await getCabProviders(pickupLat, pickupLng, dropLat, dropLng);
      if (res.data && res.data.length > 0) {
        setCabs(res.data);
        setCabProviders(res.data);
      }
      setLoading(false);
    }
    load();
  }, [recommendation, toLat, toLng, setCabProviders]);

  const sortedCabs = useMemo(() => {
    const sorted = [...cabs];
    switch (sortBy) {
      case 'Cheapest': sorted.sort((a, b) => a.price - b.price); break;
      case 'Fastest':  sorted.sort((a, b) => a.etaMinutes - b.etaMinutes); break;
      case 'Rated':    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default: break;
    }
    return sorted;
  }, [cabs, sortBy]);

  function openProvider(cab: CabProvider) {
    router.push(`/redirect?brand=${encodeURIComponent(cab.brand)}&deepLink=${encodeURIComponent(cab.deepLinkUrl)}`);
  }

  const gateNum  = recommendation?.gateRecommendation?.recommendedGate ?? '—';
  const destName = toDestination || 'Destination';

  return (
    <div>
      <div style={{ padding: '52px 20px 12px', borderBottom: `1px solid ${ER.line}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <BackBtn />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>Pick a ride</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Cab providers {loading ? '' : `· ${sortedCabs.length}`}</div>
          </div>
          <div style={{ padding: '5px 9px', borderRadius: 999, background: ER.greenS, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: ER.green }}/>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#047857' }}>Live</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: ER.bg, border: `1px solid ${ER.line2}` }}>
          <Icon name="pin" size={15} color={ER.green}/>
          <div style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>Gate {gateNum} → {destName}</div>
        </div>
      </div>

      {/* Sort chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 4px', overflowX: 'auto' }}>
        {SORT_OPTIONS.map((c) => (
          <button key={c} onClick={() => setSortBy(c)} style={{
            padding: '6px 12px', borderRadius: 999,
            background: sortBy === c ? ER.ink : '#fff',
            color:      sortBy === c ? '#fff' : ER.ink2,
            border: `1px solid ${sortBy === c ? ER.ink : ER.line}`,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
          }}>{c}</button>
        ))}
      </div>

      {/* Cab cards */}
      <div style={{ padding: '10px 20px 32px' }}>
        {loading ? (
          <>
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </>
        ) : sortedCabs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: ER.mute, fontSize: 14 }}>
            No cab providers available right now.
          </div>
        ) : sortedCabs.map((c) => (
          <div key={c.id} style={{
            background: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
            border: c.isRecommended ? `1.5px solid ${ER.green}` : `1px solid ${ER.line}`,
            boxShadow: c.isRecommended ? '0 6px 20px rgba(16,185,129,0.12)' : ER.card,
            position: 'relative',
          }}>
            {(c.isRecommended || c.isCheapest) && (
              <div style={{ position: 'absolute', top: -10, left: 14, padding: '3px 9px', borderRadius: 6, background: c.isRecommended ? ER.green : ER.ink, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {c.isRecommended ? 'Recommended' : 'Cheapest'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, boxShadow: `0 4px 10px ${c.brandColor}40` }}>
                {c.monogram}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{c.brand}</span>
                  <span style={{ fontSize: 12, color: ER.mute }}>· {c.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: ER.mute, marginTop: 3 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={11} color={ER.mute}/> {c.etaMinutes} min</span>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: ER.mute2 }}/>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="star" size={11} color={ER.amber}/> {c.rating}</span>
                  {c.surgeMultiplier && <><span style={{ width: 2, height: 2, borderRadius: 99, background: ER.mute2 }}/><span style={{ color: ER.amber, fontWeight: 700 }}>{c.surgeMultiplier}× surge</span></>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>₹{c.price}</div>
                <div style={{ fontSize: 10, color: ER.mute, fontWeight: 600, marginTop: 2 }}>est. fare</div>
              </div>
            </div>
            {c.note  && <div style={{ marginTop: 8, fontSize: 11.5, color: ER.ink3, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="info" size={12} color={ER.ink3}/> {c.note}</div>}
            {c.badge && <div style={{ marginTop: 6 }}><Pill bg={ER.amberS} color="#92400E">★ {c.badge}</Pill></div>}
            <button onClick={() => openProvider(c)} style={{
              width: '100%', marginTop: 12, height: 44, borderRadius: 12,
              background: c.isRecommended ? ER.green : ER.bg,
              color:      c.isRecommended ? '#fff' : ER.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Open {c.brand} <Icon name="arrow" size={14} color={c.isRecommended ? '#fff' : ER.ink} strokeWidth={2.5}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
