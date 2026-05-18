import { CSSProperties } from 'react';

interface PillProps {
  color?: string;
  bg?: string;
  mono?: boolean;
  style?: CSSProperties;
  children: React.ReactNode;
}

export function Pill({ color = '#0F172A', bg, mono = false, style = {}, children }: PillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        background: bg ?? 'rgba(15,23,42,0.06)',
        color,
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: mono ? 0 : -0.1,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
