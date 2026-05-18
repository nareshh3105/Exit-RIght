'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { signInWithGoogle } from '@/lib/api/auth';
import { TapBtn } from '@/components/ui/TapBtn';
import { FormField } from '@/components/forms/FormField';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    clearError();
    const ok = await login(email, password);
    if (ok) router.replace('/home');
  }

  return (
    <div style={{ padding: '52px 24px 32px', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `linear-gradient(140deg, ${ER.green} 0%, #0EA471 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
      }}>
        <svg width="22" height="22" viewBox="0 0 42 42" fill="none">
          <path d="M7 26V14a4 4 0 014-4h7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M19 21l11-11M30 10v8M30 10h-8" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 6px' }}>Welcome back</h1>
      <p style={{ fontSize: 15, color: ER.mute, marginBottom: 28, marginTop: 0 }}>Log in to plan your next commute.</p>

      {error && (
        <div style={{ background: ER.redS, border: `1px solid ${ER.red}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: ER.red }}>
          {error}
        </div>
      )}

      <FormField label="Email"    iconName="mail" type="email"    value={email}    onChange={e => setEmail(e.target.value)}    placeholder="you@example.com" autoComplete="email" />
      <FormField label="Password" iconName="lock" type={showPass ? 'text' : 'password'} trailingIcon="eye" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, marginBottom: 22 }}>
        <span style={{ fontSize: 13, color: ER.ink2, fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
      </div>

      <TapBtn onClick={handleLogin} disabled={isLoading} color={ER.green} fg="#062B1F">
        {isLoading ? 'Logging in…' : 'Continue'}
      </TapBtn>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
        <div style={{ flex: 1, height: 1, background: ER.line }}/>
        <span style={{ fontSize: 12, color: ER.mute }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: ER.line }}/>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {(['google', 'apple'] as const).map(p => (
          <button key={p} onClick={() => p === 'google' && signInWithGoogle()} style={{
            flex: 1, height: 50, borderRadius: 14, background: '#fff',
            border: `1px solid ${ER.line}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
          }}>
            <Icon name={p} size={18}/> {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <p style={{ marginTop: 'auto', paddingTop: 32, textAlign: 'center', fontSize: 13.5, color: ER.mute }}>
        New here?{' '}
        <Link href="/signup" style={{ color: ER.ink, fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
      </p>
    </div>
  );
}
