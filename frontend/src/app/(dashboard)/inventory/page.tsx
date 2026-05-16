'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Package, PackagePlus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { InventoryItem, RestockDto } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { useAuthStore } from '@/store/auth.store';

// ── StockBar ──────────────────────────────────────────────────────────────

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

// ── Restock Modal ─────────────────────────────────────────────────────────

interface RestockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

function RestockModal({ item, onClose, onSuccess }: RestockModalProps) {
  const [quantity, setQuantity] = useState(50);
  const [operation, setOperation] = useState<'add' | 'set'>('add');

  const mutation = useMutation({
    mutationFn: async (dto: RestockDto) => {
      const res = await api.patch(`/inventory/${item.productId}/restock`, dto);
      return res.data;
    },
    onSuccess: (updated) => {
      toast.success(`Updated "${item.name}" stock to ${updated.quantity} ${item.unit}`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to restock');
    },
  });

  const preview =
    operation === 'add' ? item.quantity + quantity : quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Bổ sung hàng tồn kho</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Current stock */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Số lượng hiện tại</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.quantity} <span className="text-sm font-normal text-gray-400">{item.unit}</span>
            </p>
          </div>

          {/* Operation type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hành động
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['add', 'set'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    operation === op
                      ? 'bg-coffee-600 border-coffee-600 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {op === 'add' ? '+ Thêm vào kho' : 'Đặt lại số lượng'}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Số lượng ({item.unit})
            </label>
            <input
              type="number"
              min={1}
              max={9999}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between p-3 bg-coffee-50 dark:bg-coffee-900/20 rounded-lg border border-coffee-100 dark:border-coffee-800">
            <span className="text-xs text-coffee-700 dark:text-coffee-400">Sau khi cập nhật</span>
            <span className="text-sm font-bold text-coffee-700 dark:text-coffee-300">
              {preview} {item.unit}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate({ quantity, operation })}
            disabled={mutation.isPending}
            className="flex-1 py-2 px-4 bg-coffee-600 hover:bg-coffee-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...</>
            ) : (
              <><PackagePlus className="w-3.5 h-3.5" /> Xác nhận</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

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

  const lowStock = items.filter((i) => i.quantity <= 10);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tồn kho</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAdmin ? 'Quản lý tồn kho' : 'Real-time ingredient stock'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Sắp hết hàng</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {lowStock.map((i) => i.name).join(', ')} còn rất ít.
                {isAdmin && ' Bấm vào bổ sung để thêm số lượng.'}
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Tổng sản phẩm" value={items.length}/>
            <StatCard label="Còn hàng"       value={items.filter((i) => i.quantity > 0).length}/>
            <StatCard label="Gần hết / Hết hàng"      value={lowStock.length}/>
          </div>
        )}

        {/* Inventory table */}
        <Card>
          <CardHeader>
            <CardTitle>Mức tồn kho</CardTitle>
            {/* <span className="text-xs text-gray-400">
              {isAdmin ? 'Admin: click Restock to add stock' : 'Read-only view'}
            </span> */}
          </CardHeader>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Không có dữ liệu</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sản phẩm</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Đơn vị</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 w-48">Số lượng</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Trạng thái</th>
                    {isAdmin && (
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Hành động</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => {
                    const status =
                      item.quantity === 0
                        ? { label: 'Hết hàng', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
                        : item.quantity <= 10
                        ? { label: 'Còn ít', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
                        : { label: 'Còn hàng', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };

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
                        {isAdmin && (
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setRestockTarget(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-coffee-700 dark:text-coffee-400 border border-coffee-200 dark:border-coffee-800 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-900/20 transition-colors"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              Bổ sung
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

      {/* Restock modal — chỉ admin thấy */}
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

function StatCard({ label, value, icon }: { label: string; value: number; icon?: string }) {
  return (
    <Card className="flex items-center gap-4">
      {icon && <span className="text-2xl">{icon}</span>}
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </Card>
  );
}
