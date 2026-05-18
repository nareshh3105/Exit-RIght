'use client';
import React from 'react';

type IconName =
  | 'home' | 'sparkle' | 'bookmark' | 'clock' | 'gear' | 'search' | 'pin'
  | 'walk' | 'auto' | 'bus' | 'cab' | 'gate' | 'rain' | 'sun' | 'crowd'
  | 'shield' | 'moon' | 'arrow' | 'chev' | 'chevD' | 'chevU' | 'plus'
  | 'bolt' | 'map' | 'bell' | 'star' | 'bag' | 'info' | 'eye' | 'user'
  | 'lock' | 'mail' | 'google' | 'apple' | 'check' | 'x' | 'edit' | 'train'
  | 'flag' | 'swap' | 'coins';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, className }: IconProps) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const F = { fill: color };

  const paths: Record<IconName, React.ReactNode> = {
    home:     <><path d="M3 10.5L12 3l9 7.5" {...p}/><path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" {...p}/></>,
    sparkle:  <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" {...p}/></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4V4z" {...p}/></>,
    clock:    <><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v5l3 2" {...p}/></>,
    gear:     <><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1A1.7 1.7 0 003.7 9a1.7 1.7 0 00-.3-1.8L3.3 7a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H8a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1A2 2 0 1120.7 7l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" {...p}/></>,
    search:   <><circle cx="11" cy="11" r="7" {...p}/><path d="M20 20l-3.5-3.5" {...p}/></>,
    pin:      <><path d="M12 22s7-7.6 7-13a7 7 0 10-14 0c0 5.4 7 13 7 13z" {...p}/><circle cx="12" cy="9" r="2.5" {...p}/></>,
    walk:     <><circle cx="13" cy="4.5" r="1.8" {...F}/><path d="M9 21l2-6 3 1 2 5M9 21l1.5-4.5L8 14V9l3-2 4 1 2 3" {...p}/></>,
    auto:     <><rect x="3" y="9" width="18" height="8" rx="2" {...p}/><circle cx="8" cy="17" r="2" {...p}/><circle cx="16" cy="17" r="2" {...p}/><path d="M5 9l2-3h10l2 3" {...p}/></>,
    bus:      <><rect x="4" y="4" width="16" height="14" rx="2" {...p}/><path d="M4 11h16M8 18v2M16 18v2" {...p}/><circle cx="8" cy="15" r="1" {...F}/><circle cx="16" cy="15" r="1" {...F}/></>,
    cab:      <><path d="M4 13l1.5-5a2 2 0 012-1.5h9a2 2 0 012 1.5L20 13" {...p}/><rect x="3" y="13" width="18" height="6" rx="2" {...p}/><circle cx="7" cy="19" r="1.5" {...F}/><circle cx="17" cy="19" r="1.5" {...F}/></>,
    gate:     <><path d="M4 21V8l8-5 8 5v13" {...p}/><path d="M8 21V12h8v9" {...p}/><path d="M10 16h4" {...p}/></>,
    rain:     <><path d="M7 14a4 4 0 010-8 5 5 0 019.7 1 3.5 3.5 0 01-.7 7" {...p}/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" {...p}/></>,
    sun:      <><circle cx="12" cy="12" r="4" {...p}/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" {...p}/></>,
    crowd:    <><circle cx="9" cy="8" r="3" {...p}/><circle cx="17" cy="9" r="2.5" {...p}/><path d="M3 20a6 6 0 0112 0M14 20a5 5 0 017-4.5" {...p}/></>,
    shield:   <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...p}/><path d="M9 12l2 2 4-4" {...p}/></>,
    moon:     <><path d="M20 14a8 8 0 11-10-10 6 6 0 0010 10z" {...p}/></>,
    arrow:    <><path d="M5 12h14M13 6l6 6-6 6" {...p}/></>,
    chev:     <><path d="M9 6l6 6-6 6" {...p}/></>,
    chevD:    <><path d="M6 9l6 6 6-6" {...p}/></>,
    chevU:    <><path d="M6 15l6-6 6 6" {...p}/></>,
    plus:     <><path d="M12 5v14M5 12h14" {...p}/></>,
    bolt:     <><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...p}/></>,
    map:      <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" {...p}/><path d="M9 4v14M15 6v14" {...p}/></>,
    bell:     <><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2z" {...p}/><path d="M10 20a2 2 0 004 0" {...p}/></>,
    star:     <><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3z" {...p}/></>,
    bag:      <><path d="M5 8h14l-1 12H6L5 8z" {...p}/><path d="M9 8V6a3 3 0 016 0v2" {...p}/></>,
    info:     <><circle cx="12" cy="12" r="9" {...p}/><path d="M12 8h.01M11 12h1v4h1" {...p}/></>,
    eye:      <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></>,
    user:     <><circle cx="12" cy="8" r="4" {...p}/><path d="M4 21a8 8 0 0116 0" {...p}/></>,
    lock:     <><rect x="5" y="11" width="14" height="9" rx="2" {...p}/><path d="M8 11V8a4 4 0 018 0v3" {...p}/></>,
    mail:     <><rect x="3" y="5" width="18" height="14" rx="2" {...p}/><path d="M3 7l9 6 9-6" {...p}/></>,
    google:   <><path d="M21 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.1c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.3z" fill="#4285F4"/><path d="M12 21c2.6 0 4.7-.9 6.3-2.3l-3.1-2.4c-.9.6-2 .9-3.2.9-2.4 0-4.5-1.6-5.2-3.8H3.6v2.4A9 9 0 0012 21z" fill="#34A853"/><path d="M6.8 13.4a5.4 5.4 0 010-3.4V7.6H3.6a9 9 0 000 8.2l3.2-2.4z" fill="#FBBC05"/><path d="M12 6.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9 9 0 003.6 7.6L6.8 10c.7-2.2 2.8-3.4 5.2-3.4z" fill="#EA4335"/></>,
    apple:    <><path d="M16.4 12.5c0-2.7 2.2-4 2.3-4.1a4.9 4.9 0 00-3.9-2.1c-1.7-.2-3.2 1-4 1-.8 0-2.1-1-3.4-1A5.1 5.1 0 003 9.1c-1.8 3.2-.5 7.8 1.3 10.4.9 1.2 1.9 2.6 3.3 2.5 1.3 0 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.5a11 11 0 001.4-2.9 4.5 4.5 0 01-2.6-4.1zM13.8 4.5A4.4 4.4 0 0014.9 2a4.5 4.5 0 00-3 1.5 4.2 4.2 0 00-1.1 2.4 3.7 3.7 0 003-1.4z" fill={color}/></>,
    check:    <><path d="M5 12l5 5L20 7" {...p}/></>,
    x:        <><path d="M6 6l12 12M18 6L6 18" {...p}/></>,
    edit:     <><path d="M14 4l6 6L9 21H3v-6L14 4z" {...p}/></>,
    train:    <><rect x="5" y="3" width="14" height="14" rx="3" {...p}/><path d="M5 12h14M9 17l-2 4M15 17l2 4" {...p}/><circle cx="9" cy="8" r="1" {...F}/><circle cx="15" cy="8" r="1" {...F}/></>,
    flag:     <><path d="M5 21V4M5 4h13l-2 4 2 4H5" {...p}/></>,
    swap:     <><path d="M7 4v16M3 8l4-4 4 4M17 20V4M21 16l-4 4-4-4" {...p}/></>,
    coins:    <><circle cx="9" cy="9" r="6" {...p}/><path d="M21 15a6 6 0 11-9-5.2" {...p}/></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {paths[name] ?? null}
    </svg>
  );
}
