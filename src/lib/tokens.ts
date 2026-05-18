// ─── Exit Right — Design tokens (mirrors prototype ER object) ─

export const ER = {
  // Colors
  ink:       '#0F172A',
  ink2:      '#1E293B',
  ink3:      '#334155',
  mute:      '#64748B',
  mute2:     '#94A3B8',
  line:      '#E2E8F0',
  line2:     '#EEF1F5',
  bg:        '#F7F8FA',
  bg2:       '#FFFFFF',
  green:     '#10B981',
  greenS:    '#ECFDF5',
  amber:     '#F59E0B',
  amberS:    '#FFFBEB',
  red:       '#EF4444',
  redS:      '#FEF2F2',
  blue:      '#2563EB',
  blueS:     '#EFF6FF',
  // Night mode
  nightBg:    '#0A0F1E',
  nightSurf:  '#111827',
  nightSurf2: '#0F1626',
  nightInk:   '#F1F5F9',
  nightMute:  '#94A3B8',
  nightLine:  'rgba(255,255,255,0.08)',
  // Shadows
  card:    '0 1px 2px rgba(15,23,42,0.04), 0 6px 18px rgba(15,23,42,0.06)',
  cardHi:  '0 2px 4px rgba(15,23,42,0.05), 0 14px 36px rgba(15,23,42,0.10)',
  // Typography
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  // Border radius
  r:  14,
  r2: 20,
  r3: 28,
} as const;

export type ERTokens = typeof ER;
