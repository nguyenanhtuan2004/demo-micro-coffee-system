'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';

const statusFilters: Array<'ALL' | OrderStatus> = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'];

const statusLabels: Record<'ALL' | OrderStatus, string> = {
  ALL: 'Tất cả',
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn tất',
  REJECTED: 'Bị từ chối',
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL');

  const { data: orders = [], isLoading, refetch, isFetching } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders');
      return res.data;
    },
    refetchInterval: 4000,
  });

  const completeOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch<Order>(`/orders/${orderId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Đã hoàn tất đơn hàng');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể hoàn tất đơn hàng');
    },
  });

  const filteredOrders = useMemo(
    () => (status === 'ALL' ? orders : orders.filter((order) => order.status === status)),
    [orders, status],
  );

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1;
        return acc;
      },
      { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, REJECTED: 0 } as Record<OrderStatus, number>,
    );
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Đơn hàng</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Theo dõi trạng thái Saga, lý do từ chối và các đơn đã hoàn tất.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tải lại đơn hàng"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Chờ xử lý" value={counts.PENDING} />
        <SummaryCard label="Đã xác nhận" value={counts.CONFIRMED} />
        <SummaryCard label="Hoàn tất" value={counts.COMPLETED} />
        <SummaryCard label="Bị từ chối" value={counts.REJECTED} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === item
                    ? 'bg-coffee-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {statusLabels[item]}
              </button>
            ))}
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Không có đơn hàng phù hợp.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đơn hàng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Món</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng tiền</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thời gian tạo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs text-gray-700 dark:text-gray-300">#{order.id.slice(0, 8)}</div>
                      <div className="mt-1 max-w-[140px] truncate text-xs text-gray-400">{order.customerId}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {order.items.map((item) => (
                          <span key={item.id} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                      {order.rejectionReason && (
                        <p className="mt-2 max-w-md text-xs text-red-600 dark:text-red-400">{order.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {order.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => completeOrder.mutate(order.id)}
                          disabled={completeOrder.isPending}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Hoàn tất
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Không có</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </Card>
  );
}
