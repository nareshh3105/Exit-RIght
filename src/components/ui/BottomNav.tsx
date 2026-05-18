'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ER } from '@/lib/tokens';
import { Icon } from './Icon';

const TABS = [
  { id: 'home',    label: 'Home',     icon: 'home'     as const, href: '/home'     },
  { id: 'recs',    label: 'Recs',     icon: 'sparkle'  as const, href: '/recommendation' },
  { id: 'saved',   label: 'Saved',    icon: 'bookmark' as const, href: '/saved'    },
  { id: 'history', label: 'History',  icon: 'clock'    as const, href: '/history'  },
  { id: 'set',     label: 'Settings', icon: 'gear'     as const, href: '/settings' },
];

interface BottomNavProps {
  dark?: boolean;
}

export function BottomNav({ dark = false }: BottomNavProps) {
  const pathname = usePathname();

  const bg       = dark ? '#1C2B27' : '#FFFFFF';
  const surface  = dark ? 'rgba(16,185,129,0.18)' : ER.greenS;
  const onActive = dark ? ER.nightInk : ER.ink;
  const offIco   = dark ? ER.nightMute : ER.mute;

  return (
    <nav
      style={{
        background: bg,
        boxShadow: dark
          ? '0 -1px 0 rgba(255,255,255,0.06)'
          : '0 -1px 0 rgba(15,23,42,0.07), 0 -4px 16px rgba(15,23,42,0.04)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 12,
        paddingBottom: 14,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 64,
                height: 32,
                borderRadius: 999,
                background: active ? surface : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={active ? ER.green : offIco}
                strokeWidth={active ? 2.25 : 1.75}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? onActive : offIco,
                letterSpacing: 0.1,
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
