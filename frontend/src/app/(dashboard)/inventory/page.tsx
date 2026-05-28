'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Package, PackagePlus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { InventoryItem, RestockDto } from '@/types';

function StockBar({ quantity, max = 120 }: { quantity: number; max?: number }) {
  const pct = Math.min((quantity / max) * 100, 100);
  const color =
    quantity === 0 ? 'bg-red-500' :
    quantity <= 10 ? 'bg-amber-500' :
    quantity <= 30 ? 'bg-yellow-400' :
    'bg-emerald-500';

  return (
    <div className="flex w-full items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-gray-500 dark:text-gray-400">{quantity}</span>
    </div>
  );
}

function RestockModal({ item, onClose, onSuccess }: {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [quantity, setQuantity] = useState(50);
  const [operation, setOperation] = useState<'add' | 'set'>('add');

  const mutation = useMutation({
    mutationFn: async (dto: RestockDto) => {
      const res = await api.patch(`/inventory/${item.productId}/restock`, dto);
      return res.data;
    },
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật tồn kho ${item.name}: ${updated.quantity} ${item.unit}`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Nhập kho thất bại');
    },
  });

  const preview = operation === 'add' ? item.quantity + quantity : quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Nhập kho</p>
            <p className="mt-0.5 text-xs text-gray-500">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="mb-1 text-xs text-gray-500">Tồn hiện tại</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.quantity} <span className="text-sm font-normal text-gray-400">{item.unit}</span>
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Cách cập nhật
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['add', 'set'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    operation === op
                      ? 'border-coffee-600 bg-coffee-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {op === 'add' ? 'Cộng thêm' : 'Đặt lại'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Số lượng ({item.unit})
            </label>
            <input
              type="number"
              min={1}
              max={9999}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-coffee-100 bg-coffee-50 p-3 dark:border-coffee-800 dark:bg-coffee-900/20">
            <span className="text-xs text-coffee-700 dark:text-coffee-400">Sau cập nhật</span>
            <span className="text-sm font-bold text-coffee-700 dark:text-coffee-300">
              {preview} {item.unit}
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate({ quantity, operation })}
            disabled={mutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-coffee-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-700 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang lưu...</>
            ) : (
              <><PackagePlus className="h-3.5 w-3.5" /> Xác nhận</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);

  const { data: items = [], isLoading, refetch, isFetching } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get<InventoryItem[]>('/inventory');
      return res.data;
    },
    refetchInterval: 8000,
  });

  const lowStock = items.filter((item) => item.quantity <= item.lowStockThreshold);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tồn kho</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Quản lý số lượng tồn và nhập kho' : 'Theo dõi số lượng tồn hiện tại'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Tải lại tồn kho"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {lowStock.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Cảnh báo tồn thấp</p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                {lowStock.map((item) => item.name).join(', ')} đang dưới ngưỡng cảnh báo.
              </p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Tổng món" value={items.length} />
            <StatCard label="Còn hàng" value={items.filter((item) => item.quantity > 0).length} />
            <StatCard label="Tồn thấp" value={lowStock.length} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Mức tồn kho</CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Chưa có dữ liệu tồn kho.</p>
            </div>
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Món</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đơn vị</th>
                    <th className="w-48 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượng</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                    {isAdmin && (
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => {
                    const status =
                      item.quantity === 0
                        ? { label: 'Hết hàng', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
                        : item.quantity <= item.lowStockThreshold
                        ? { label: 'Tồn thấp', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
                        : { label: 'Còn hàng', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{item.unit}</td>
                        <td className="px-5 py-3.5">
                          <StockBar quantity={item.quantity} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setRestockTarget(item)}
                              className="flex items-center gap-1.5 rounded-lg border border-coffee-200 px-3 py-1.5 text-xs font-medium text-coffee-700 transition-colors hover:bg-coffee-50 dark:border-coffee-800 dark:text-coffee-400 dark:hover:bg-coffee-900/20"
                            >
                              <PackagePlus className="h-3.5 w-3.5" />
                              Nhập kho
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {restockTarget && isAdmin && (
        <RestockModal
          item={restockTarget}
          onClose={() => setRestockTarget(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventory'] })}
        />
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </Card>
  );
}
