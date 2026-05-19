'use client';
import { useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, loadProfile } = useAuthStore();

  useEffect(() => {
    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !profile) {
        await loadProfile(session.user.id);
      }
    }
    initSession();
  }, []);

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
