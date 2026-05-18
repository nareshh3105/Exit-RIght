'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ER } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';

interface PlacesAutocompleteProps {
  onSelect: (place: { name: string; address: string; lat: number; lng: number }) => void;
  placeholder?: string;
  defaultValue?: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const CHENNAI_BOUNDS = {
  south: 12.85,
  west: 80.05,
  north: 13.25,
  east: 80.40,
};

export default function PlacesAutocomplete({
  onSelect,
  placeholder = 'Search destination...',
  defaultValue = '',
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || typeof window === 'undefined') return;

    if (window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      serviceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    };
    document.head.appendChild(script);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!serviceRef.current || input.length < 2) {
      setPredictions([]);
      return;
    }

    serviceRef.current.getPlacePredictions(
      {
        input,
        locationBias: new google.maps.LatLngBounds(
          { lat: CHENNAI_BOUNDS.south, lng: CHENNAI_BOUNDS.west },
          { lat: CHENNAI_BOUNDS.north, lng: CHENNAI_BOUNDS.east },
        ),
        componentRestrictions: { country: 'in' },
      },
      (results) => {
        setPredictions(results ?? []);
        setShowDropdown(!!results?.length);
      },
    );
  }, []);

  const handleSelect = useCallback(
    (prediction: Prediction) => {
      setQuery(prediction.structured_formatting.main_text);
      setShowDropdown(false);

      if (!geocoderRef.current) return;

      geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          onSelect({
            name: prediction.structured_formatting.main_text,
            address: prediction.description,
            lat: loc.lat(),
            lng: loc.lng(),
          });
        }
      });
    },
    [onSelect],
  );

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: ER.bg2,
          borderRadius: ER.r,
          padding: '0 16px',
          height: 52,
          gap: 12,
        }}
      >
        <Icon name="search" size={18} color={ER.mute} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            fetchPredictions(e.target.value);
          }}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: ER.ink,
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setPredictions([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <Icon name="x" size={16} color={ER.mute} />
          </button>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            background: ER.bg,
            borderRadius: ER.r,
            boxShadow: ER.cardHi,
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {predictions.map((p) => (
            <button
              key={p.place_id}
              onClick={() => handleSelect(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                borderBottom: `1px solid ${ER.line}`,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Icon name="pin" size={16} color={ER.mute} />
              <div>
                <p style={{ margin: 0, fontSize: 14, color: ER.ink, fontWeight: 500 }}>
                  {p.structured_formatting.main_text}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: ER.mute, marginTop: 2 }}>
                  {p.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
