'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, ShoppingCart, Minus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { MENU_ITEMS } from '@/lib/menu';
import { Order, CreateOrderDto, MenuItem } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  // ── Queries ───────────────────────────────────────────────────────────

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders');
      return res.data;
    },
    refetchInterval: 4000,
  });

  // ── Mutations ─────────────────────────────────────────────────────────

  const createOrder = useMutation({
    mutationFn: async (dto: CreateOrderDto) => {
      const res = await api.post<Order>('/orders', dto);
      return res.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Đơn hàng #${order.id.slice(0, 8)} đã được đặt — chờ xác nhận`);
      setCart([]);
      setShowForm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đặt đơn hàng thất bại');
    },
  });

  // ── Cart helpers ──────────────────────────────────────────────────────

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    createOrder.mutate({
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
      })),
    });
  };

  // ── Render ────────────────────────────────────────────────────────────

  const coffeeItems = MENU_ITEMS.filter((m) => m.category === 'Coffee');
  const foodItems = MENU_ITEMS.filter((m) => m.category === 'Food');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Đơn hàng</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quản lý đơn đặt hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Đơn hàng mới
          </button>
        </div>
      </div>

      {/* Order form */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coffee</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {coffeeItems.map((item) => (
                  <MenuCard key={item.productId} item={item} onAdd={addToCart} />
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Food</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {foodItems.map((item) => (
                  <MenuCard key={item.productId} item={item} onAdd={addToCart} />
                ))}
              </div>
            </Card>
          </div>

          {/* Cart */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Giỏ hàng
                  {cart.length > 0 && (
                    <span className="ml-1 bg-coffee-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.reduce((s, c) => s + c.quantity, 0)}
                    </span>
                  )}
                </span>
              </CardTitle>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Xóa
                </button>
              )}
            </CardHeader>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                Chưa có sản phẩm nào được thêm vào
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(item.productId, -1)}
                        className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.productId, 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Tổng</span>
                    <span className="text-sm font-bold text-coffee-600">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={createOrder.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-coffee-600 hover:bg-coffee-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors"
                  >
                    {createOrder.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Đang đặt hàng...</>
                    ) : (
                      'Đặt hàng'
                    )}
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn đặt hàng gần đây</CardTitle>
          {/* <span className="text-xs text-gray-400">Auto-refreshes every 4s</span> */}
        </CardHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có đơn đặt hàng nào. Tạo đơn hàng đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">ID đơn hàng</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sản phẩm</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Tổng</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Thời gian đặt hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item) => (
                          <span key={item.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
                            {item.name} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
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

// ── Menu Card sub-component ───────────────────────────────────────────────

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="flex flex-col items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-coffee-300 dark:hover:border-coffee-700 hover:bg-coffee-50 dark:hover:bg-coffee-900/10 transition-all text-left"
    >
      <span className="text-xl mb-1">{item.emoji}</span>
      <span className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{item.name}</span>
      <span className="text-xs text-coffee-600 dark:text-coffee-400 font-semibold mt-0.5">${item.price.toFixed(2)}</span>
    </button>
  );
}
