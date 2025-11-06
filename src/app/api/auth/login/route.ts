import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email || !body.password) {
    return new NextResponse(
      JSON.stringify({ message: 'Missing email or password', statusCode: 400 }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { email, password } = body;

  const sb = supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookieStore = await cookies();

  cookieStore.set('sb-access-token', data.session?.access_token);
  cookieStore.set('sb-refresh-token', data.session?.refresh_token);

  return new NextResponse(JSON.stringify({ message: 'Login successful' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE() {
  const sb = supabaseServer();
  await sb.auth.signOut();

  const cookieStore = await cookies();

  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return new NextResponse(JSON.stringify({ message: 'Logout successful' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
