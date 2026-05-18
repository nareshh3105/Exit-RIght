'use client';

import { ER } from '@/lib/tokens';
import Icon from './Icon';

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div
      style={{
        background: ER.redS,
        borderRadius: ER.r,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Icon name="info" size={20} color={ER.red} />
      <p style={{ flex: 1, color: ER.red, fontSize: 14, margin: 0 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: ER.red,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
