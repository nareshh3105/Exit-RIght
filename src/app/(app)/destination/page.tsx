'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BackBtn } from '@/components/ui/BackBtn';
import PlacesAutocomplete from '@/components/map/PlacesAutocomplete';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';
import { getSavedRoutes } from '@/lib/api/saved';
import type { SavedRoute } from '@/types';

export default function DestinationPage() {
  const router = useRouter();
  const profile = useAuthStore(s => s.profile);
  const { fromStation, setDestination } = useRouteStore();
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    if (profile?.id) {
      getSavedRoutes(profile.id).then(res => {
        if (res.data) setSavedRoutes(res.data);
      });
    }
  }, [profile?.id]);

  function select(name: string, addr: string, lat?: number, lng?: number) {
    setDestination(name, addr, lat, lng);
    router.push('/recommendation');
  }

  const quickSlots = [
    ...savedRoutes.slice(0, 3).map(r => ({
      label: r.name,
      icon: (r.icon || 'pin') as any,
      color: r.color || ER.green,
      lat: r.destinationLat,
      lng: r.destinationLng,
      address: r.address,
    })),
    { label: 'Add', icon: 'plus' as any, color: ER.mute, lat: undefined, lng: undefined, address: '' },
  ];

  return (
    <div>
      {/* From/To header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${ER.line}`, padding: '52px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <BackBtn />
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Where to?</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div style={{ width: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: ER.blue, border: `2px solid ${ER.blueS}`, boxShadow: `0 0 0 1px ${ER.blue}` }}/>
            <span style={{ flex: 1, width: 2, background: `repeating-linear-gradient(to bottom, ${ER.mute2} 0 3px, transparent 3px 7px)`, margin: '4px 0' }}/>
            <span style={{ width: 10, height: 10, background: ER.green }}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 44, display: 'flex', alignItems: 'center', fontSize: 14.5, fontWeight: 600, color: ER.ink2, borderBottom: `1px solid ${ER.line2}`, gap: 8 }}>
              <Icon name="train" size={16} color={ER.blue}/>
              {fromStation?.name ?? 'Guindy'} Metro
            </div>
            <div style={{ paddingTop: 4, paddingBottom: 4 }}>
              <PlacesAutocomplete
                placeholder="Where are you going?"
                onSelect={(place) => select(place.name, place.address, place.lat, place.lng)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick saves */}
      <div style={{ padding: '16px 20px 4px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {quickSlots.map(r => (
            <div key={r.label} className="er-tap"
              onClick={() => r.label !== 'Add' ? select(r.label, r.address ?? '', r.lat, r.lng) : router.push('/saved')}
              style={{
                flex: 1, height: 64, borderRadius: 14, background: '#fff', border: `1px solid ${ER.line}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <Icon name={r.icon} size={18} color={r.color}/>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
