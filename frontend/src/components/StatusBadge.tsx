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
  COMPLETED: {
    label: 'Hoàn tất',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  REJECTED: {
    label: 'Bị từ chối',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
