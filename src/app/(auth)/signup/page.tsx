'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { BackBtn } from '@/components/ui/BackBtn';
import { TapBtn } from '@/components/ui/TapBtn';
import { FormField } from '@/components/forms/FormField';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';

const STATIONS = ['Guindy', 'Alandur', 'Vadapalani', 'Egmore', 'CMBT', 'Little Mount'];

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [homeStation, setHomeStation] = useState('Guindy');
  const [agreed,      setAgreed]      = useState(false);

  async function handleRegister() {
    clearError();
    if (!agreed) return;
    const ok = await register(email, password, fullName, homeStation);
    if (ok) router.replace('/home');
  }

  return (
    <div style={{ padding: '52px 24px 32px' }}>
      <BackBtn />
      <div style={{ height: 22 }}/>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 6px' }}>Create account</h1>
      <p style={{ fontSize: 15, color: ER.mute, marginBottom: 24, marginTop: 0 }}>Two minutes. No card, no hassle.</p>

      {error && (
        <div style={{ background: ER.redS, border: `1px solid ${ER.red}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: ER.red }}>
          {error}
        </div>
      )}

      <FormField label="Full name" iconName="user"  type="text"     value={fullName}  onChange={e => setFullName(e.target.value)}  placeholder="Aanya Ramanathan" />
      <FormField label="Email"     iconName="mail"  type="email"    value={email}     onChange={e => setEmail(e.target.value)}     placeholder="you@example.com" />
      <FormField label="Password"  iconName="lock"  type="password" value={password}  onChange={e => setPassword(e.target.value)}  hint="Min. 8 characters" placeholder="Min. 8 characters" />

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: ER.mute, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 8 }}>Home station</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATIONS.map(s => (
            <button key={s} onClick={() => setHomeStation(s)} style={{
              padding: '8px 14px', borderRadius: 999,
              background: homeStation === s ? ER.ink : '#fff',
              color:      homeStation === s ? '#fff' : ER.ink2,
              border:     `1px solid ${homeStation === s ? ER.ink : ER.line}`,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {homeStation === s && '✓ '}{s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 22, cursor: 'pointer' }} onClick={() => setAgreed(v => !v)}>
        <div style={{
          width: 20, height: 20, borderRadius: 6,
          background: agreed ? ER.green : '#fff',
          border: `1px solid ${agreed ? ER.green : ER.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
        }}>
          {agreed && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
        </div>
        <p style={{ fontSize: 12.5, color: ER.mute, lineHeight: 1.5, margin: 0 }}>
          I agree to the <span style={{ color: ER.ink, fontWeight: 600 }}>Terms</span> and anonymised data use.
        </p>
      </div>

      <TapBtn onClick={handleRegister} disabled={isLoading || !agreed} color={ER.green} fg="#062B1F">
        {isLoading ? 'Creating account…' : 'Create account'}
      </TapBtn>
    </div>
  );
}
