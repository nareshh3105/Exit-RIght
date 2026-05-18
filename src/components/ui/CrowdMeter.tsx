import { ER } from '@/lib/tokens';
import type { CrowdLevel } from '@/types';

interface CrowdMeterProps {
  level: CrowdLevel;
  dark?: boolean;
}

export function CrowdMeter({ level, dark = false }: CrowdMeterProps) {
  const colors: Record<number, string> = { 0: ER.green, 1: ER.green, 2: ER.amber, 3: ER.red };
  const c   = colors[level] ?? ER.mute;
  const off = dark ? 'rgba(255,255,255,0.18)' : ER.line;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
      {[5, 8, 11].map((h, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 1.5,
            background: i < level ? c : off,
            display: 'block',
          }}
        />
      ))}
    </span>
  );
}
