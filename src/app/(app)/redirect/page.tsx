'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';

const WEB_FALLBACKS: Record<string, string> = {
  Uber: 'https://m.uber.com',
  Ola: 'https://book.olacabs.com',
  Rapido: 'https://www.rapido.bike',
  'Namma Yatri': 'https://nammayatri.in',
};

function RedirectContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const brand       = params.get('brand') ?? 'Uber';
  const deepLink    = params.get('deepLink') ?? '';
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      if (deepLink) {
        window.location.href = deepLink;
        setTimeout(() => {
          window.location.href = WEB_FALLBACKS[brand] ?? `https://www.google.com/search?q=${brand}+ride`;
        }, 2000);
      } else {
        router.back();
      }
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router, deepLink, brand]);

  const circumference = 2 * Math.PI * 36;

  return (
    <div style={{
      minHeight: '100dvh', background: ER.ink, color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'inherit', gap: 20,
      padding: 32, boxSizing: 'border-box',
    }}>
      <div style={{ width: 80, height: 80, borderRadius: 99, background: 'rgba(16,185,129,0.15)', border: `2px solid ${ER.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: 'absolute' }}>
          <circle cx="40" cy="40" r="36" fill="none" stroke={ER.green} strokeWidth="3"
            strokeDasharray={`${((3 - count) / 3) * circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>{count}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Redirecting to</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8 }}>{brand}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 8, lineHeight: 1.5 }}>
          Opening {brand} with your pickup at Gate 2, Guindy Metro.
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="shield" size={18} color={ER.green}/>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Trip shared with Priya</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>Live location active</div>
          </div>
        </div>
      </div>

      <button onClick={() => router.back()} style={{
        padding: '12px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)', fontSize: 14, fontWeight: 600,
        color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Cancel
      </button>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense>
      <RedirectContent />
    </Suspense>
  );
}
