'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { CreateOrderDto, MenuItem, Order } from '@/types';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function PosPage() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('Tất cả');

  const { data: menu = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<MenuItem[]>('/products');
      return res.data;
    },
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders');
      return res.data;
    },
    refetchInterval: 3000,
  });

  const createOrder = useMutation({
    mutationFn: async (dto: CreateOrderDto) => {
      const res = await api.post<Order>('/orders', dto);
      return res.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Đã tạo đơn #${order.id.slice(0, 8)}`);
      setCart([]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Tạo đơn hàng thất bại');
    },
  });

  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(menu.map((item) => item.category)))], [menu]);
  const filteredMenu = category === 'Tất cả' ? menu : menu.filter((item) => item.category === category);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const recentOrders = orders.slice(0, 4);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.productId === item.productId);
      if (!existing) return [...prev, { ...item, quantity: 1 }];

      return prev.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      );
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const submitOrder = () => {
    if (!cart.length) return;
    createOrder.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bán hàng</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Tạo đơn hàng từ menu đang hoạt động ở phía máy chủ.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === item
                      ? 'bg-coffee-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </CardHeader>

          {menuLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredMenu.map((item) => (
                <button
                  key={item.productId}
                  onClick={() => addToCart(item)}
                  className="min-h-28 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-coffee-400 hover:bg-coffee-50 dark:border-gray-700 dark:hover:border-coffee-700 dark:hover:bg-coffee-900/10"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">{item.name}</p>
                  <p className="mt-1 text-sm font-bold text-coffee-600 dark:text-coffee-400">
                    ${item.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Giỏ hàng
                </span>
              </CardTitle>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  aria-label="Xóa giỏ hàng"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </CardHeader>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Chọn món để bắt đầu tạo đơn.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} / món</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(item.productId, -1)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label={`Giảm số lượng ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.productId, 1)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label={`Tăng số lượng ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{itemCount} món</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={submitOrder}
                    disabled={createOrder.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-coffee-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coffee-700 disabled:opacity-60"
                  >
                    {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    Tạo đơn hàng
                  </button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái mới nhất</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {recentOrders.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">Chưa có đơn hàng.</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/70">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-gray-700 dark:text-gray-300">#{order.id.slice(0, 8)}</p>
                      <p className="truncate text-xs text-gray-500">
                        {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
