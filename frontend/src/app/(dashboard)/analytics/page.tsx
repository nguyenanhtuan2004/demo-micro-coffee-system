'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BarChart3, CheckCircle2, DollarSign, Loader2, RefreshCw, ShoppingCart, Trophy, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { api } from '@/lib/api';
import { Analytics, InventoryItem } from '@/types';

export default function AnalyticsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get<Analytics>('/analytics');
      return res.data;
    },
    refetchInterval: 6000,
  });

  const { data: lowStock = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const res = await api.get<InventoryItem[]>('/inventory/low-stock');
      return res.data;
    },
    refetchInterval: 6000,
  });

  const maxSold = data?.allProducts?.[0]?.totalSold ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Thống kê</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Read model CQRS được cập nhật từ các sự kiện RabbitMQ.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tải lại thống kê"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Doanh thu" value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} />
            <KpiCard label="Đã xác nhận" value={String(data?.totalOrders ?? 0)} icon={<ShoppingCart className="h-5 w-5 text-blue-600" />} />
            <KpiCard label="Hoàn tất" value={String(data?.completedOrders ?? 0)} icon={<CheckCircle2 className="h-5 w-5 text-indigo-600" />} />
            <KpiCard label="Bị từ chối" value={String(data?.rejectedOrders ?? 0)} icon={<XCircle className="h-5 w-5 text-red-600" />} />
            <KpiCard label="Tồn thấp" value={String(lowStock.length)} icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle>Món bán chạy</CardTitle>
                <Trophy className="h-4 w-4 text-amber-500" />
              </CardHeader>

              {!data?.allProducts?.length ? (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu bán hàng.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.allProducts.map((product, index) => {
                    const pct = (product.totalSold / maxSold) * 100;
                    return (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="w-5 flex-shrink-0 text-right text-xs text-gray-400">{index + 1}</span>
                        <span className="w-36 flex-shrink-0 truncate text-sm text-gray-900 dark:text-white">{product.name}</span>
                        <div className="h-6 flex-1 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div
                            className="flex h-full items-center rounded-lg bg-coffee-500 pl-2 transition-all duration-500"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          >
                            {pct > 18 && <span className="text-xs font-medium text-white">{product.totalSold}</span>}
                          </div>
                        </div>
                        <span className="w-16 flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
                          ${product.totalRevenue.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tồn kho thấp</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>

              {!lowStock.length ? (
                <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Tất cả món đều trên ngưỡng cảnh báo.</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-900/10">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Ngưỡng cảnh báo {item.lowStockThreshold} {item.unit}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="truncate text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
