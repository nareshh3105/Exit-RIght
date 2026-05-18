'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getSavedRoutes } from '@/lib/api/saved';
import { Pill } from '@/components/ui/Pill';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import type { SavedRoute } from '@/types';

// Fallback data for first load / demo
const DEMO: SavedRoute[] = [
  { id:'1', userId:'', name:'Home',    address:'T. Nagar · 2.4 km',   icon:'home', color:ER.green,   preferredGate:2, preferredMode:'auto', estimatedEta:'14m', estimatedCost:'₹38',  createdAt:'' },
  { id:'2', userId:'', name:'Office',  address:'Tidel Park · 1.8 km', icon:'bag',  color:ER.blue,    preferredGate:1, preferredMode:'cab',  estimatedEta:'11m', estimatedCost:'₹128', createdAt:'' },
  { id:'3', userId:'', name:'College', address:'IIT Madras · 0.9 km', icon:'flag', color:ER.amber,   preferredGate:3, preferredMode:'walk', estimatedEta:'9m',  estimatedCost:'Free', createdAt:'' },
  { id:'4', userId:'', name:'Mom',     address:'Adyar · Sastri Nagar',icon:'user', color:'#A855F7',  preferredGate:2, preferredMode:'bus',  estimatedEta:'23m', estimatedCost:'₹16', createdAt:'' },
];

export default function SavedPage() {
  const router  = useRouter();
  const profile = useAuthStore(s => s.profile);
  const [routes, setRoutes] = useState<SavedRoute[]>(DEMO);

  useEffect(() => {
    if (!profile) return;
    getSavedRoutes(profile.id).then(({ data }) => { if (data?.length) setRoutes(data); });
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
        {routes.map(s => (
          <div key={s.id} className="er-tap" onClick={() => router.push('/recommendation')} style={{
            background: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
            border: `1px solid ${ER.line}`, boxShadow: ER.card,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {/* @ts-expect-error dynamic icon */}
              <Icon name={s.icon} size={22} color={s.color}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: ER.mute, marginTop: 2 }}>{s.address}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Pill bg={ER.bg} color={ER.ink2}>Gate {s.preferredGate}</Pill>
                <Pill bg={ER.bg} color={ER.ink2}>{s.estimatedEta}</Pill>
                <Pill bg={ER.bg} color={ER.ink2} mono>{s.estimatedCost}</Pill>
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
