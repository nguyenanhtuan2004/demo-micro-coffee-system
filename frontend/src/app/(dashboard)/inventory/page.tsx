'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { InventoryItem } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/Card';

function StockBar({ quantity, max = 120 }: { quantity: number; max?: number }) {
  const pct = Math.min((quantity / max) * 100, 100);
  const color =
    quantity === 0 ? 'bg-red-500' :
    quantity <= 10 ? 'bg-amber-500' :
    quantity <= 30 ? 'bg-yellow-400' :
    'bg-emerald-500';

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{quantity}</span>
    </div>
  );
}

export default function InventoryPage() {
  const { data: items = [], isLoading, refetch, isFetching } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get<InventoryItem[]>('/inventory');
      return res.data;
    },
    refetchInterval: 8000,
  });

  const lowStock = items.filter((i) => i.quantity <= 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time ingredient stock</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Low stock alert</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {lowStock.map((i) => i.name).join(', ')} {lowStock.length === 1 ? 'is' : 'are'} running low.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Products" value={items.length} icon="📦" />
          <StatCard label="In Stock" value={items.filter((i) => i.quantity > 0).length} icon="✅" />
          <StatCard label="Low / Out of Stock" value={lowStock.length} icon="⚠️" />
        </div>
      )}

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <span className="text-xs text-gray-400">Updated by inventory service via Saga events</span>
        </CardHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No inventory data</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Unit</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 w-48">Stock Level</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => {
                  const status =
                    item.quantity === 0 ? { label: 'Out of stock', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' } :
                    item.quantity <= 10 ? { label: 'Low stock', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' } :
                    { label: 'In stock', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{item.unit}</td>
                      <td className="px-5 py-3.5">
                        <StockBar quantity={item.quantity} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </Card>
  );
}
