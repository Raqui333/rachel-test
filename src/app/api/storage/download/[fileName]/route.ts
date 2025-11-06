import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const fileName = (await params).fileName;

    if (!fileName) {
      return NextResponse.json({ message: 'Missing fileName' }, { status: 400 });
    }

    const token = request.cookies.get('sb-access-token')?.value;
    const supabase = supabaseServer();

    const { data: dataUser } = await supabase.auth.getUser(token);

    const userId = dataUser.user?.id;

    const { data, error } = await supabase.storage
      .from('documents')
      .download(`${userId}/${fileName}`);

    if (error || !data) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
