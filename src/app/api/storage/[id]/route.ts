import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const folder = (await params).id;
    const body = await request.json();

    if (!body.fileName) {
      return NextResponse.json({ message: 'Missing fileName' }, { status: 400 });
    }

    const token = request.cookies.get('sb-access-token')?.value;
    const supabase = supabaseServer();

    const { data: dataUser } = await supabase.auth.getUser(token);
    const role = dataUser.user?.user_metadata.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await supabase.storage.from('documents').remove([`${folder}/${body.fileName}`]);

    await prisma.document.deleteMany({
      where: { title: `${folder}/${body.fileName}` },
    });

    return NextResponse.json({ message: 'file deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
