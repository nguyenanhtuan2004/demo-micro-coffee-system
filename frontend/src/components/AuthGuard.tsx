'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const ADMIN_ONLY_ROUTES = ['/analytics', '/staff'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const token    = useAuthStore((s) => s.token);
  const user     = useAuthStore((s) => s.user);

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored && !token) {
      router.replace('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    const currentRole = user?.role ?? (storedUser ? JSON.parse(storedUser).role : null);
    if (currentRole && currentRole !== 'admin') {
      const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
      if (isAdminOnly) router.replace('/orders');
    }
  }, [token, user, pathname, router]);

  const stored = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token && !stored) return null;

  return <>{children}</>;
}
