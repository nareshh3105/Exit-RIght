'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getSavedRoutes } from '@/lib/api/saved';
import { Pill } from '@/components/ui/Pill';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import type { SavedRoute } from '@/types';

export default function SavedPage() {
  const router  = useRouter();
  const profile = useAuthStore(s => s.profile);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getSavedRoutes(profile.id).then(({ data }) => {
      if (data?.length) setRoutes(data);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div>
      <div style={{ padding: '52px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>{routes.length} places</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>Saved</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 99, background: ER.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="plus" size={18} color="#fff" strokeWidth={2.5}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 20px 32px' }}>
        {loading ? (
          <div style={{ color: ER.mute, fontSize: 13, padding: '16px 0' }}>Loading…</div>
        ) : routes.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ER.ink2 }}>No saved places yet</div>
            <div style={{ fontSize: 13, color: ER.mute, marginTop: 4 }}>Tap + to save your frequent destinations.</div>
          </div>
        ) : routes.map(s => (
          <div key={s.id} className="er-tap" onClick={() => router.push('/recommendation')} style={{
            background: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
            border: `1px solid ${ER.line}`, boxShadow: ER.card,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: (s.color || ER.green) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={(s.icon || 'pin') as any} size={22} color={s.color || ER.green}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: ER.mute, marginTop: 2 }}>{s.address}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {s.preferredGate && <Pill bg={ER.bg} color={ER.ink2}>Gate {s.preferredGate}</Pill>}
                {s.estimatedEta  && <Pill bg={ER.bg} color={ER.ink2}>{s.estimatedEta}</Pill>}
                {s.estimatedCost && <Pill bg={ER.bg} color={ER.ink2} mono>{s.estimatedCost}</Pill>}
              </div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 10, background: ER.ink, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              Go <Icon name="arrow" size={11} color="#fff" strokeWidth={2.5}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
