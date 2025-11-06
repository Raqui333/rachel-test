import { NextRequest, NextResponse } from 'next/server';

import { supabaseBrowser } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const sb = supabaseBrowser();

  const { data } = await sb.auth.getUser(token);

  if (data.user?.user_metadata.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.profile.findMany();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
