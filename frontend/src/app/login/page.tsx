'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { LoginResponse } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password });
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Chào mừng trở lại, ${res.data.user.name}!`);
      router.replace('/pos');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-coffee-50 to-orange-50 px-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-coffee-600 shadow-lg">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nhóm 2</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hệ thống POS quán cà phê</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Đăng nhập tài khoản</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-coffee-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coffee-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-coffee-100 bg-coffee-50 p-3 dark:border-coffee-800 dark:bg-coffee-900/20">
            <p className="mb-1 text-xs font-medium text-coffee-700 dark:text-coffee-400">Tài khoản demo</p>
            <p className="text-xs text-coffee-600 dark:text-coffee-500">admin@example.com / 123456</p>
            <p className="mt-1 text-xs text-coffee-600 dark:text-coffee-500">barista@example.com / barista123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
