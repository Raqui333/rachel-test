import { NextRequest, NextResponse } from 'next/server';

import { supabaseBrowser } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email || !body.password || !body.name) {
    return new NextResponse(
      JSON.stringify({ message: 'Missing email or password', statusCode: 400 }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { email, password, name } = body;

  const sb = supabaseBrowser();
  const { error, data } = await sb.auth.signUp({
    email,
    password,
    options: { data: { first_name: name, role: 'user' } },
  });

  if (error) {
    return new NextResponse(JSON.stringify({ message: error.message, statusCode: 400 }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authUser = data.user;

  await prisma.profile.create({
    data: {
      userId: authUser!.id,
      fullName: name,
    },
  });

  return new NextResponse(JSON.stringify({ message: 'Sign up successful', statusCode: 200 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
