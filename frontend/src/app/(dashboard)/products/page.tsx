'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { api } from '@/lib/api';
import { MenuItem } from '@/types';

export default function ProductsPage() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, refetch, isFetching } = useQuery<MenuItem[]>({
    queryKey: ['products', 'admin'],
    queryFn: async () => {
      const res = await api.get<MenuItem[]>('/products/admin');
      return res.data;
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, active }: { productId: string; active: boolean }) => {
      const res = await api.patch<MenuItem>(`/products/${productId}`, { active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'admin'] });
      toast.success('Đã cập nhật món trong menu');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cập nhật món thất bại');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý menu</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Quản lý giá, danh mục và trạng thái hoạt động của từng món.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tải lại menu"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách món</CardTitle>
          <span className="text-xs text-gray-400">{products.length} món</span>
        </CardHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Món</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Danh mục</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Giá</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{product.emoji || '☕'}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="font-mono text-xs text-gray-400">{product.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{product.category}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {product.active ? 'Đang bán' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => updateProduct.mutate({ productId: product.productId, active: !product.active })}
                        disabled={updateProduct.isPending}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {product.active ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        Bật/tắt
                      </button>
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
