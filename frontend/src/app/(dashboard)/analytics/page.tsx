'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, DollarSign, Loader2, RefreshCw, ShoppingCart, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { Analytics } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/Card';

export default function AnalyticsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get<Analytics>('/analytics');
      return res.data;
    },
    refetchInterval: 6000,
  });

  const maxSold = data?.allProducts?.[0]?.totalSold ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Thống kê</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý doanh thu bán hàng và doanh số sản phẩm
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Tổng doanh thu"
              value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`}
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
              bg="bg-emerald-50 dark:bg-emerald-900/20"
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
            />
            <KpiCard
              label="Tổng đơn hàng"
              value={String(data?.totalOrders ?? 0)}
              icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
              bg="bg-blue-50 dark:bg-blue-900/20"
              iconBg="bg-blue-100 dark:bg-blue-900/40"
            />
            <KpiCard
              label="Sản phẩm bán chạy nhất"
              value={data?.topProducts?.[0]?.name ?? '—'}
              icon={<Trophy className="w-5 h-5 text-amber-600" />}
              bg="bg-amber-50 dark:bg-amber-900/20"
              iconBg="bg-amber-100 dark:bg-amber-900/40"
            />
          </div>

          {/* Top products bar chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm bán chạy</CardTitle>
              <span className="text-xs text-gray-400">Theo đơn vị bán</span>
            </CardHeader>

            {!data?.allProducts?.length ? (
              <div className="text-center py-12">
                <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có dữ liệu nào.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.allProducts.map((product, idx) => {
                  const pct = (product.totalSold / maxSold) * 100;
                  return (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="w-5 text-xs text-gray-400 text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="w-36 text-sm text-gray-900 dark:text-white truncate flex-shrink-0">
                        {product.name}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-coffee-500 rounded-lg transition-all duration-500 flex items-center pl-2"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        >
                          {pct > 20 && (
                            <span className="text-xs text-white font-medium">{product.totalSold}</span>
                          )}
                        </div>
                      </div>
                      <span className="w-16 text-right text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        ${product.totalRevenue.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Architecture note */}
          {/* <Card className="bg-coffee-50 dark:bg-coffee-900/10 border-coffee-200 dark:border-coffee-800">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📖</span>
              <div>
                <p className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1">
                  CQRS Pattern in action
                </p>
                <p className="text-xs text-coffee-700 dark:text-coffee-400 leading-relaxed">
                  This analytics data is built exclusively from <strong>OrderConfirmed</strong> events consumed via RabbitMQ.
                  The Analytics Service never queries the Order Service database directly —
                  it maintains its own read-optimised database updated only through events.
                  This is the core principle of CQRS (Command Query Responsibility Segregation).
                </p>
              </div>
            </div>
          </Card> */}
        </>
      )}
    </div>
  );
}

function KpiCard({
  label, value, icon, bg, iconBg,
}: {
  label: string; value: string; icon: React.ReactNode; bg: string; iconBg: string;
}) {
  return (
    <Card className={`${bg} border-transparent`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        </div>
      </div>
    </Card>
  );
}
