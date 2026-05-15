import { OrderStatus } from '@/types';

const config: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  REJECTED: {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
