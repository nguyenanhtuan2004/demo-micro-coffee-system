'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Coffee, LogOut, Package, ShoppingCart, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

const allNavItems = [
  { href: '/orders',    label: 'Đặt hàng',    icon: ShoppingCart, roles: ['admin', 'barista'] },
  { href: '/inventory', label: 'Tồn kho', icon: Package,      roles: ['admin', 'barista'] },
  { href: '/analytics', label: 'Thống kê', icon: BarChart3,    roles: ['admin'] },
  { href: '/staff',     label: 'Nhân sự',     icon: Users,        roles: ['admin'] },
];

const ROLE_CONFIG = {
  admin:   { label: 'Admin',   className: 'bg-coffee-100 text-coffee-700 dark:bg-coffee-900/40 dark:text-coffee-300' },
  barista: { label: 'Barista', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    router.replace('/login');
  };

  const role       = user?.role ?? 'barista';
  const navItems   = allNavItems.filter((item) => item.roles.includes(role));
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.barista;

  return (
    <aside className="w-60 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-coffee-600 flex items-center justify-center shadow-sm">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Nhóm 2</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">System Coffee Shop</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-coffee-50 dark:bg-coffee-900/30 text-coffee-700 dark:text-coffee-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-coffee-600 dark:text-coffee-400' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-coffee-100 dark:bg-coffee-900 flex items-center justify-center flex-shrink-0">
            <span className="text-coffee-700 dark:text-coffee-300 text-xs font-bold uppercase">
              {user?.name?.[0] ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleConfig.className}`}>
                {roleConfig.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
