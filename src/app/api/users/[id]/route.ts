import { NextRequest, NextResponse } from 'next/server';

import { supabaseServer } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const validRoles = ['admin', 'mod', 'user'];

  const body = await request.json();

  if (!body) {
    return NextResponse.json({ message: 'Missing body' }, { status: 400 });
  }

  const id = (await params).id;

  const token = request.cookies.get('sb-access-token')?.value;

  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser(token);

  if (data.user?.user_metadata.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (body.role && !validRoles.includes(body.role)) {
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  }

  try {
    await prisma.profile.update({
      where: { userId: id },
      data: body,
    });

    supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        role: body.role,
      },
    });
  } catch (error) {
    supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        role: 'user',
      },
    });
    console.error(error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Profile updated' });
}
