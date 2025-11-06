'use server';

import { cookies } from 'next/headers';

export async function getAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  return token;
}
