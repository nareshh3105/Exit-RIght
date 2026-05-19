import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') ?? '/home';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll:  () => cookieStore.getAll(),
          setAll:  (cs: Array<{ name: string; value: string; options?: Record<string, unknown> }>) =>
            cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const user = session.user;
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        const fullName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User';
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          home_station: 'Guindy',
          avatar_initials: initials,
          preferred_mode: 'cab',
          budget_cap: 200,
          theme: 'auto',
        });
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
