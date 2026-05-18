'use client';

import { ER } from '@/lib/tokens';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = 'search', title, subtitle }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 12,
      }}
    >
      <Icon name={icon as any} size={40} color={ER.mute} />
      <p style={{ color: ER.ink2, fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</p>
      {subtitle && (
        <p style={{ color: ER.mute, fontSize: 14, margin: 0, textAlign: 'center' }}>{subtitle}</p>
      )}
    </div>
  );
}
