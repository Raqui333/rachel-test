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
import { set } from 'date-fns';

export default function SignUpPage() {
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [supabaseError, setSupabaseError] = useState('');
  const [passDontMatch, setPassDontMatch] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmmit = async () => {
    try {
      setError('');
      setSupabaseError('');
      setPassDontMatch(false);
      setLoading(true);

      formSchema.parse({ name, email, password, confirmPassword });

      if (password !== confirmPassword) {
        setPassDontMatch(true);
        return;
      }

      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await resp.json();

      if (resp.status !== 200) {
        setSupabaseError(data.message);
        return;
      }

      router.push('/auth/login');
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
            <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="bg-background"
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-red-500">{getErrorFor('name')}</p>}
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="bg-background"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="text-red-500">{getErrorFor('confirmPassword')}</p>}
            {passDontMatch && <p className="text-red-500">Passwords do not match</p>}
          </div>
          <Button
            className="w-full bg-[#2C3E50] hover:bg-[#1a252f] text-white"
            size="lg"
            asChild
            onClick={onSubmmit}
          >
            <Button>{loading ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}</Button>
          </Button>
          {supabaseError && <p className="text-red-500 text-center">{supabaseError}</p>}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline underline-offset-4 hover:text-foreground">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link href="/auth/login" className="hover:text-foreground flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>
        <Link href="#" className="hover:text-foreground">
          Privacy & Security
        </Link>
      </div>
    </div>
  );
}
