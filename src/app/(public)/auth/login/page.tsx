'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [supabaseError, setSupabaseError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmmit = async () => {
    try {
      setError('');
      setLoading(true);

      formSchema.parse({ email, password });

      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (resp.status !== 200) {
        setSupabaseError(data.message);
        return;
      }

      router.push('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorFor = (field: string) => {
    if (error) {
      const zodError = JSON.parse(error).find((item: any) => item.path[0] === field);
      return zodError?.message;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="text-5xl font-bold">R</div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-background"
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500">{getErrorFor('email')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-background"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500">{getErrorFor('password')}</p>}
          </div>
          <Button
            className="w-full bg-[#2C3E50] hover:bg-[#1a252f] text-white"
            size="lg"
            asChild
            onClick={onSubmmit}
          >
            <Button>{loading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}</Button>
          </Button>
          {supabaseError && <p className="text-red-500 text-center">{supabaseError}</p>}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link href="#" className="hover:text-foreground flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>
        <Link href="#" className="hover:text-foreground">
          Privacy & Security
        </Link>
      </div>
    </div>
  );
}
