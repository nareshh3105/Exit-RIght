'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '@/components/ui/Icon';
import { ER } from '@/lib/tokens';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 24, borderRadius: 99,
      background: on ? ER.green : ER.line,
      position: 'relative', flexShrink: 0, border: 'none', cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 20, height: 20, borderRadius: 99, background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        transition: 'left 0.18s ease',
      }}/>
    </button>
  );
}

function Row({ icon, tint, label, detail, toggle, on, onToggle }: {
  icon: string; tint: string; label: string; detail?: string;
  toggle?: boolean; on?: boolean; onToggle?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: `1px solid ${ER.line2}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: tint + '1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* @ts-expect-error */}
        <Icon name={icon} size={16} color={tint}/>
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
      {toggle
        ? <Toggle on={on!} onToggle={onToggle!}/>
        : <><span style={{ fontSize: 13, color: ER.mute, marginRight: 4 }}>{detail}</span><Icon name="chev" size={14} color={ER.mute2}/></>
      }
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 600, color: ER.mute, letterSpacing: 0.5, textTransform: 'uppercase', padding: '16px 20px 8px' }}>{title}</div>
      <div style={{ margin: '0 20px', background: '#fff', borderRadius: 16, border: `1px solid ${ER.line}`, overflow: 'hidden' }}>{children}</div>
    </>
  );
}

export default function SettingsPage() {
  const profile = useAuthStore(s => s.profile);
  const logout  = useAuthStore(s => s.logout);
  const {
    preferredTransport, budgetCap, theme,
    safetyModeAtNight, notifications,
    toggleSafetyMode, toggleNotification,
  } = useSettingsStore();

  const TRANSPORT_LABELS: Record<string, string> = { cab: 'Cab', auto: 'Auto', bus: 'Bus', walk: 'Walk' };

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ padding: '52px 20px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: ER.mute, letterSpacing: 0.4, textTransform: 'uppercase' }}>{profile?.email}</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>Settings</div>
      </div>

      {/* Profile card */}
      <div style={{ padding: '0 20px 6px' }}>
        <div style={{ background: ER.ink, borderRadius: 18, padding: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, boxShadow: ER.cardHi }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: 'linear-gradient(135deg, #FDE68A, #F59E0B)', color: ER.ink, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.avatarInitials ?? 'ME'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{profile?.fullName ?? 'Your Name'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>28 trips · ₹1,240 saved</div>
          </div>
          <Icon name="chev" size={16} color="rgba(255,255,255,0.5)"/>
        </div>
      </div>

      <Section title="Preferences">
        <Row icon="cab"     tint={ER.blue}  label="Preferred transport" detail={TRANSPORT_LABELS[preferredTransport]}/>
        <Row icon="coins"   tint={ER.amber} label="Budget cap / trip"   detail={`₹${budgetCap}`}/>
        <Row icon="sparkle" tint="#A855F7"  label="Theme"               detail={theme.charAt(0).toUpperCase() + theme.slice(1)}/>
      </Section>

      <Section title="Safety">
        <Row icon="shield" tint={ER.green} label="Safety mode at night" toggle on={safetyModeAtNight}   onToggle={toggleSafetyMode}/>
        <Row icon="user"   tint={ER.ink3}  label="Trusted contacts"     detail="2 people"/>
        <Row icon="moon"   tint={ER.ink3}  label="Night mode threshold" detail="9 PM"/>
      </Section>

      <Section title="Notifications">
        <Row icon="bell"  tint={ER.amber} label="Exit reminders" toggle on={notifications.exitReminders}  onToggle={() => toggleNotification('exitReminders')}/>
        <Row icon="rain"  tint={ER.blue}  label="Weather alerts" toggle on={notifications.weatherAlerts}  onToggle={() => toggleNotification('weatherAlerts')}/>
        <Row icon="crowd" tint="#A855F7"  label="Crowd warnings" toggle on={notifications.crowdWarnings}  onToggle={() => toggleNotification('crowdWarnings')}/>
      </Section>

      {/* Sign out */}
      <div style={{ padding: '20px 20px 0' }}>
        <button onClick={() => logout()} style={{
          width: '100%', height: 50, borderRadius: 14, background: ER.redS,
          border: `1px solid ${ER.red}20`, color: ER.red,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Sign out
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: ER.mute, padding: '20px 0 8px' }}>
        Exit Right · v1.0.0 · Made in Chennai
      </div>
    </div>
  );
}
