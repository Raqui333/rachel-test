import { supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get('sb-access-token')?.value;
  const { pathname } = req.nextUrl;

  if (!accessToken) return NextResponse.redirect(new URL('/auth/login', req.url));

  const supabase = supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (pathname.startsWith('/admin')) {
    const role = user?.user_metadata.role;
    if (role !== 'admin') return NextResponse.redirect(new URL('/', req.url));
  }

  if (error || !user) return NextResponse.redirect(new URL('/auth/login', req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/(|admin|mod|rag)'],
};
