import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import getEmbedContent from '@/lib/embeddings';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
export async function POST(request: NextRequest) {
  const allowedTypes = ['text/plain', 'application/pdf'];

  try {
    const token = request.cookies.get('sb-access-token')?.value;
    const supabase = supabaseServer();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const { data } = await supabase.auth.getUser(token);

    const fileName = `${data.user?.id}/${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await supabase.storage.from('documents').upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    let text = '';

    if (file.type === 'text/plain') {
      text = await file.text();

      const vector = await getEmbedContent(text);
      await supabase.from('Document').insert({
        id: randomUUID(),
        userId: data.user?.id,
        title: fileName,
        content: text,
        embedding: vector,
      });
    }

    // todo: parser pdf

    return NextResponse.json({ message: 'file uploaded', status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value;
    const supabase = supabaseServer();

    const { data: dataUser } = await supabase.auth.getUser(token);
    const userId = dataUser.user?.id;
    const role = dataUser.user?.user_metadata.role;

    if (role == 'admin') {
      const { data: folders } = await supabase.storage.from('documents').list();

      const files = await Promise.all(
        folders?.map(async (folder) => {
          const { data } = await supabase.storage.from('documents').list(folder.name, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

          return data!.map((file) => ({
            folder: folder.name,
            id: file.id,
            name: file.name,
            type: file.metadata.mimetype || 'unknown',
            size: formatFileSize(file.metadata.size),
          }));
        }) ?? []
      );

      return NextResponse.json(files.flat(), { status: 200 });
    }

    const { data } = await supabase.storage.from('documents').list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    const returnObject = data!.map((file) => {
      return {
        id: file.id,
        name: file.name,
        type: file.metadata.mimetype,
        size: formatFileSize(file.metadata.size),
      };
    });

    return NextResponse.json(returnObject, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const allowedRoles = ['mod', 'admin'];

  try {
    const body = await request.json();

    if (!body.fileName) {
      return NextResponse.json({ message: 'Missing fileName' }, { status: 400 });
    }

    const token = request.cookies.get('sb-access-token')?.value;
    const supabase = supabaseServer();

    const { data: dataUser } = await supabase.auth.getUser(token);
    const role = dataUser.user?.user_metadata.role;

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = dataUser.user?.id;

    const { data } = await supabase.storage
      .from('documents')
      .remove([`${userId}/${body.fileName}`]);

    if (data?.length === 0) {
      return NextResponse.json({ message: 'file not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'file deleted', file: data![0].name }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
