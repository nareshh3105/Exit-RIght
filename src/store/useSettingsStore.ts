import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, SafetyContact } from '@/types';

interface SettingsState extends UserSettings {
  trustedContacts: SafetyContact[];
  setPreferredTransport: (mode: UserSettings['preferredTransport']) => void;
  setBudgetCap:          (cap: number) => void;
  setTheme:              (theme: UserSettings['theme']) => void;
  toggleSafetyMode:      () => void;
  setNightThreshold:     (time: string) => void;
  toggleNotification:    (key: keyof UserSettings['notifications']) => void;
  addTrustedContact:     (contact: SafetyContact) => void;
  removeTrustedContact:  (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      preferredTransport: 'cab',
      budgetCap:          200,
      theme:              'auto',
      safetyModeAtNight:  true,
      nightModeThreshold: '21:00',
      notifications: {
        exitReminders:  true,
        weatherAlerts:  true,
        crowdWarnings:  false,
      },
      trustedContacts: [],

      setPreferredTransport: (mode) => set({ preferredTransport: mode }),
      setBudgetCap:          (cap)  => set({ budgetCap: cap }),
      setTheme:              (theme)=> set({ theme }),
      toggleSafetyMode:      ()     => set((s) => ({ safetyModeAtNight: !s.safetyModeAtNight })),
      setNightThreshold:     (time) => set({ nightModeThreshold: time }),

      toggleNotification: (key) =>
        set((s) => ({
          notifications: { ...s.notifications, [key]: !s.notifications[key] },
        })),

      addTrustedContact: (contact) =>
        set((s) => ({ trustedContacts: [...s.trustedContacts, contact] })),

      removeTrustedContact: (id) =>
        set((s) => ({ trustedContacts: s.trustedContacts.filter((c) => c.id !== id) })),
    }),
    { name: 'er-settings' }
  )
);
