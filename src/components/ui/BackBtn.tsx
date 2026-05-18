'use client';
import { useRouter } from 'next/navigation';
import { ER } from '@/lib/tokens';
import { Icon } from './Icon';

interface BackBtnProps {
  dark?: boolean;
  href?: string;
}

export function BackBtn({ dark = false, href }: BackBtnProps) {
  const router = useRouter();
  const handleBack = () => (href ? router.push(href) : router.back());

  return (
    <button
      onClick={handleBack}
      style={{
        width: 40,
        height: 40,
        borderRadius: 99,
        background: dark ? 'rgba(255,255,255,0.1)' : '#fff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : ER.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      <Icon name="chev" size={18} color={dark ? '#fff' : ER.ink} strokeWidth={2.5} />
    </button>
  );
}
