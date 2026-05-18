// ─── MapBg — static street-map placeholder ───────────────────
// In production, replace with Mapbox GL or Google Maps.
// The SVG road grid is a faithful recreation of the prototype's design.
import { CSSProperties, ReactNode } from 'react';

interface MapBgProps {
  dark?: boolean;
  height?: number | string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function MapBg({ dark = false, height = '100%', children, style = {} }: MapBgProps) {
  const base   = dark ? '#0B1426' : '#EAF1F5';
  const road   = dark ? '#1B2942' : '#FFFFFF';
  const block  = dark ? '#10182B' : '#DDE6EC';
  const greenF = dark ? '#0F2E26' : '#D9EBE2';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: base,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 360 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <rect x="-20" y="-20" width="160" height="170" fill={block} />
        <rect x="180" y="-20" width="200" height="120" fill={block} />
        <rect x="-20" y="200" width="120" height="220" fill={block} />
        <rect x="140" y="160" width="160" height="120" fill={block} opacity="0.7" />
        <rect x="320" y="150" width="80"  height="220" fill={block} />
        <rect x="20"  y="460" width="180" height="200" fill={block} />
        <rect x="240" y="320" width="160" height="320" fill={block} opacity="0.6" />
        <rect x="140" y="290" width="100" height="90"  rx="6" fill={greenF} />
        <g stroke={road} strokeWidth="22" strokeLinecap="butt" fill="none">
          <path d="M-10 175 H 380" />
          <path d="M-10 440 H 380" />
          <path d="M125 -10 V 620" />
          <path d="M310 -10 V 620" />
        </g>
        <g stroke={road} strokeWidth="10" fill="none" opacity="0.8">
          <path d="M-10 80 H 380" />
          <path d="M-10 290 H 380" />
          <path d="M-10 540 H 380" />
          <path d="M55 -10 V 620" />
          <path d="M220 -10 V 620" />
        </g>
        <g
          stroke={dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)'}
          strokeWidth="1"
          strokeDasharray="6 6"
          fill="none"
        >
          <path d="M0 175 H 380" />
          <path d="M0 440 H 380" />
          <path d="M125 0 V 620" />
          <path d="M310 0 V 620" />
        </g>
      </svg>
      {children}
    </div>
  );
}
