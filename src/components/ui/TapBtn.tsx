'use client';
import { ER } from '@/lib/tokens';
import { Icon } from './Icon';
import { CSSProperties } from 'react';

interface TapBtnProps {
  children: React.ReactNode;
  color?: string;
  fg?: string;
  onClick?: () => void;
  style?: CSSProperties;
  showArrow?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function TapBtn({
  children,
  color = ER.ink,
  fg = '#fff',
  onClick,
  style = {},
  showArrow = true,
  disabled = false,
  type = 'button',
}: TapBtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        height: 54,
        borderRadius: 14,
        background: disabled ? ER.line : color,
        color: disabled ? ER.mute : fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: -0.2,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 8px 20px rgba(15,23,42,0.15)',
        fontFamily: 'inherit',
        transition: 'opacity 0.15s, transform 0.1s',
        ...style,
      }}
    >
      {children}
      {showArrow && <Icon name="arrow" size={18} color={disabled ? ER.mute : fg} />}
    </button>
  );
}
