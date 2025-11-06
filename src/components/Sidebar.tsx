'use client';

import { Home, Shield, Settings, Brain } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { getAccessToken } from '@/actions/utils';
export default function Sidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState('');

  useEffect(() => {
    const sb = supabaseBrowser();

    getAccessToken().then((token) => {
      sb.auth.getUser(token).then((t) => {
        setRole(t.data.user?.user_metadata.role);
      });
    });
  }, []);

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <div className="text-2xl font-bold">R</div>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        <Link href="/">
          <Button
            variant={pathname === '/' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Home className="h-5 w-5" />
            Home
          </Button>
        </Link>
        <Link href="/admin">
          {role === 'admin' && (
            <Button
              variant={pathname === '/admin' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              size="lg"
            >
              <Settings className="h-5 w-5" />
              Administração
            </Button>
          )}
        </Link>
        <Link href="/mod">
          <Button
            variant={pathname === '/mod' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Shield className="h-5 w-5" />
            Moderação
          </Button>
        </Link>
        <Link href="/rag">
          <Button
            variant={pathname === '/rag' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Brain className="h-5 w-5" />
            RAG
          </Button>
        </Link>
      </nav>
    </>
  );
}
