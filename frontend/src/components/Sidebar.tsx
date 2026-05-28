'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Coffee, LogOut, Package, ShoppingCart, Store, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const allNavItems = [
  { href: '/pos', label: 'Bán hàng', icon: ShoppingCart, roles: ['admin', 'barista'] },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart, roles: ['admin', 'barista'] },
  { href: '/products', label: 'Menu', icon: Store, roles: ['admin'] },
  { href: '/inventory', label: 'Tồn kho', icon: Package, roles: ['admin', 'barista'] },
  { href: '/analytics', label: 'Thống kê', icon: BarChart3, roles: ['admin'] },
  { href: '/staff', label: 'Nhân sự', icon: Users, roles: ['admin'] },
];

const ROLE_CONFIG = {
  admin: {
    label: 'Quản trị',
    className: 'bg-coffee-100 text-coffee-700 dark:bg-coffee-900/40 dark:text-coffee-300',
  },
  barista: {
    label: 'Nhân viên',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    router.replace('/login');
  };

  const role = user?.role ?? 'barista';
  const navItems = allNavItems.filter((item) => item.roles.includes(role));
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.barista;

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coffee-600 shadow-sm">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">POS cà phê</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">MVP học thuật</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-coffee-50 text-coffee-700 dark:bg-coffee-900/30 dark:text-coffee-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-coffee-600 dark:text-coffee-400' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-800">
        <div className="mb-1 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-coffee-100 dark:bg-coffee-900">
            <span className="text-xs font-bold uppercase text-coffee-700 dark:text-coffee-300">
              {user?.name?.[0] ?? 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${roleConfig.className}`}>
                {roleConfig.label}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
