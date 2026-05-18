import { supabase } from '@/lib/supabase';
import type { ApiResponse, Profile } from '@/types';

// ── Sign up ───────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  homeStation: string
): Promise<ApiResponse<Profile>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, home_station: homeStation },
    },
  });

  if (error || !data.user) return { data: null, error: error?.message ?? 'Sign-up failed' };

  // Create profile row
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: fullName,
    home_station: homeStation,
    avatar_initials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    preferred_mode: 'cab',
    budget_cap: 200,
    theme: 'auto',
  });

  if (profileError) return { data: null, error: profileError.message };

  return {
    data: {
      id: data.user.id,
      email,
      fullName,
      homeStation,
      avatarInitials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      preferredMode: 'cab',
      budgetCap: 200,
      theme: 'auto',
      createdAt: new Date().toISOString(),
    },
    error: null,
  };
}

// ── Sign in ───────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ userId: string }>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { data: null, error: error.message };
  return { data: { userId: data.user.id }, error: null };
}

// ── Sign in with OAuth ────────────────────────────────────────
export async function signInWithGoogle(): Promise<ApiResponse<null>> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  });
  return { data: null, error: error?.message ?? null };
}

// ── Sign out ──────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Get profile ───────────────────────────────────────────────
export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Profile not found' };

  return {
    data: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      homeStation: data.home_station,
      avatarInitials: data.avatar_initials,
      preferredMode: data.preferred_mode,
      budgetCap: data.budget_cap,
      theme: data.theme,
      createdAt: data.created_at,
    },
    error: null,
  };
}

// ── Update profile ────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'fullName' | 'homeStation' | 'preferredMode' | 'budgetCap' | 'theme'>>
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      home_station: updates.homeStation,
      preferred_mode: updates.preferredMode,
      budget_cap: updates.budgetCap,
      theme: updates.theme,
    })
    .eq('id', userId);

  return { data: null, error: error?.message ?? null };
}
