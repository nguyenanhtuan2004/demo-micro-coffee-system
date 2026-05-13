'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored && !token) {
      router.replace('/login');
    }
  }, [token, router]);

  const stored = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token && !stored) return null;

  return <>{children}</>;
}
