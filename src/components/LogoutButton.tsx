'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const resp = await fetch('/api/auth/login', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (resp.ok) router.push('/auth/login');
  };

  return (
    <Button variant="ghost" className="w-full justify-start gap-3" size="lg" onClick={handleLogout}>
      Log Out
    </Button>
  );
}
