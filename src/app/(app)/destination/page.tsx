'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteStore } from '@/store/useRouteStore';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';

export default function DestinationPage() {
  const router = useRouter();
  const { fromStation, setDestination } = useRouteStore();

  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef   = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const acRef       = useRef<any>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const [address,    setAddress]    = useState('');
  const [coords,     setCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady,   setMapReady]   = useState(false);
  const [searching,  setSearching]  = useState(false);

  // Station coords (fallback to Guindy)
  const stLat = fromStation?.lat ?? 13.0067;
  const stLng = fromStation?.lng ?? 80.2206;

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center = { lat: stLat, lng: stLng };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit.station.rail', stylers: [{ visibility: 'on' }] },
      ],
    });

    geocoderRef.current = new google.maps.Geocoder();
    mapInstance.current = map;

    // Center pin marker (always stays center)
    const marker = new google.maps.Marker({
      position: center,
      map,
      draggable: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: ER.green,
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
    });
    markerRef.current = marker;

    // Update on map idle (user panned)
    map.addListener('idle', () => {
      const c = map.getCenter();
      if (!c) return;
      const lat = c.lat();
      const lng = c.lng();
      marker.setPosition({ lat, lng });
      setCoords({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Autocomplete on search input
    if (inputRef.current) {
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        bounds: new google.maps.LatLngBounds(
          { lat: 12.85, lng: 80.05 },
          { lat: 13.25, lng: 80.40 },
        ),
        componentRestrictions: { country: 'in' },
        fields: ['geometry', 'name', 'formatted_address'],
      });
      acRef.current = ac;

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          map.panTo({ lat, lng });
          map.setZoom(15);
          setCoords({ lat, lng });
          setAddress(place.formatted_address ?? place.name ?? '');
        }
      });
    }

    reverseGeocode(stLat, stLng);
    setCoords({ lat: stLat, lng: stLng });
    setMapReady(true);
  }, [stLat, stLng, reverseGeocode]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    if ((window as any).google?.maps?.places) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [initMap]);

  function confirmDestination() {
    if (!coords || !address) return;
    const name = address.split(',')[0];
    setDestination(name, address, coords.lat, coords.lng);
    router.push('/recommendation');
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>

      {/* Search bar overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '52px 16px 12px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{
            width: 42, height: 42, borderRadius: 99, background: '#fff',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)', flexShrink: 0,
          }}>
            <Icon name="arrow" size={18} color={ER.ink} strokeWidth={2.5}/>
          </button>
          <div style={{
            flex: 1, height: 46, background: '#fff', borderRadius: 14,
            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <Icon name="search" size={16} color={ER.mute}/>
            <input
              ref={inputRef}
              placeholder="Search destination…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 14, fontFamily: 'inherit', color: ER.ink,
                background: 'transparent',
              }}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1, width: '100%' }}/>

      {/* Center pin indicator */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <svg width="32" height="42" viewBox="0 0 32 42">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill={ER.green}/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>

      {/* "Move map to pin location" hint */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, 20px)',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)', color: '#fff',
          padding: '4px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          Drag map to set location
        </div>
      </div>

      {/* Bottom confirm sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '16px 20px 40px',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: ER.line }}/>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: ER.mute, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
          Selected destination
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: ER.greenS, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <Icon name="pin" size={18} color={ER.green}/>
          </div>
          <div style={{ flex: 1 }}>
            {address ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{address.split(',')[0]}</div>
                <div style={{ fontSize: 12, color: ER.mute, marginTop: 3, lineHeight: 1.4 }}>
                  {address.split(',').slice(1).join(',').trim()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: ER.mute }}>Pan the map to select a location…</div>
            )}
          </div>
        </div>

        <button
          onClick={confirmDestination}
          disabled={!coords || !address}
          style={{
            width: '100%', height: 54, borderRadius: 16,
            background: coords ? ER.green : ER.line,
            color: coords ? '#062B1F' : ER.mute,
            fontSize: 16, fontWeight: 700, border: 'none',
            cursor: coords ? 'pointer' : 'default',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: coords ? '0 8px 24px rgba(16,185,129,0.35)' : 'none',
          }}
        >
          Confirm Destination
          <Icon name="arrow" size={20} color={coords ? '#062B1F' : ER.mute} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}
