'use client';
import { BottomNav } from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F7F8FA',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>
      <main className="er-scroll" style={{ flex: 1 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
