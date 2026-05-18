import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        er: {
          ink:    '#0F172A',
          ink2:   '#1E293B',
          ink3:   '#334155',
          mute:   '#64748B',
          mute2:  '#94A3B8',
          line:   '#E2E8F0',
          line2:  '#EEF1F5',
          bg:     '#F7F8FA',
          bg2:    '#FFFFFF',
          green:  '#10B981',
          greens: '#ECFDF5',
          amber:  '#F59E0B',
          ambers: '#FFFBEB',
          red:    '#EF4444',
          reds:   '#FEF2F2',
          blue:   '#2563EB',
          blues:  '#EFF6FF',
          night:     '#0A0F1E',
          nightsurf: '#111827',
          nightink:  '#F1F5F9',
          nightmute: '#94A3B8',
          nightline: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        er: '14px',
        er2: '20px',
        er3: '28px',
      },
      boxShadow: {
        'er-card': '0 1px 2px rgba(15,23,42,0.04), 0 6px 18px rgba(15,23,42,0.06)',
        'er-card-hi': '0 2px 4px rgba(15,23,42,0.05), 0 14px 36px rgba(15,23,42,0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
