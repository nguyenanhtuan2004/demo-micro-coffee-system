'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { CreateStaffDto, StaffMember, UserRole } from '@/types';

function AddStaffModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateStaffDto>({
    name: '',
    email: '',
    password: '',
    role: 'barista',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateStaffDto>>({});

  const validate = () => {
    const nextErrors: Partial<CreateStaffDto> = {};
    if (!form.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên';
    if (!form.email.includes('@')) nextErrors.email = 'Email không hợp lệ';
    if (form.password.length < 6) nextErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (dto: CreateStaffDto) => api.post('/users', dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`Đã thêm tài khoản ${res.data.name}`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Thêm nhân sự thất bại');
    },
  });

  const handleSubmit = () => {
    if (validate()) mutation.mutate(form);
  };

  const field = (label: string, key: keyof CreateStaffDto, type = 'text') => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={key === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={form[key] as string}
          onChange={(e) => {
            setForm({ ...form, [key]: e.target.value });
            setErrors({ ...errors, [key]: undefined });
          }}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:bg-gray-800 dark:text-white ${
            errors[key] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        {key === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Thêm nhân sự</p>
            <p className="mt-0.5 text-xs text-gray-500">Tài khoản mới có hiệu lực ngay sau khi tạo</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          {field('Họ tên', 'name')}
          {field('Email', 'email', 'email')}
          {field('Mật khẩu', 'password', 'password')}

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              {(['barista', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.role === role
                      ? role === 'admin'
                        ? 'border-coffee-600 bg-coffee-600 text-white'
                        : 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {form.role === 'admin'
                ? 'Toàn quyền truy cập hệ thống'
                : 'Có quyền tạo đơn hàng và xem tồn kho'}
            </p>
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
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-coffee-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-700 disabled:opacity-60"
          >
            {mutation.isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang thêm...</>
              : <><Plus className="h-3.5 w-3.5" /> Thêm</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.delete(`/users/${member.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`Đã xóa tài khoản ${member.name}`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xóa nhân sự thất bại');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Xóa tài khoản?</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {member.name} ({member.email}) sẽ mất quyền truy cập ngay.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

const ROLE_BADGE = {
  admin: 'bg-coffee-100 text-coffee-700 dark:bg-coffee-900/40 dark:text-coffee-300',
  barista: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function StaffPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const { data: staff = [], isLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.get<StaffMember[]>('/users');
      return res.data;
    },
  });

  const admins = staff.filter((member) => member.role === 'admin');
  const baristas = staff.filter((member) => member.role === 'barista');

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nhân sự</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Quản lý tài khoản nhân sự</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-coffee-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-700"
          >
            <Plus className="h-4 w-4" />
            Thêm nhân sự
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tổng tài khoản" value={staff.length} color="text-gray-900 dark:text-white" />
          <StatCard label="Quản trị" value={admins.length} color="text-coffee-600 dark:text-coffee-400" />
          <StatCard label="Nhân viên" value={baristas.length} color="text-blue-600 dark:text-blue-400" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhân sự</CardTitle>
            <span className="text-xs text-gray-400">{staff.length} tài khoản</span>
          </CardHeader>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-coffee-500" />
            </div>
          ) : staff.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500">Chưa có tài khoản nhân sự.</p>
            </div>
          ) : (
            <div className="-mx-5 divide-y divide-gray-100 dark:divide-gray-800">
              {staff.map((member) => {
                const isSelf = member.id === currentUser?.id;
                const initials = member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
                const avatarColor = member.role === 'admin'
                  ? 'bg-coffee-100 dark:bg-coffee-900/40 text-coffee-700 dark:text-coffee-300'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';

                return (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor}`}>
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        {isSelf && (
                          <span className="flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>

                    <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_BADGE[member.role]}`}>
                      {member.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                    </span>

                    <span className="hidden flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 sm:block">
                      {new Date(member.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    <button
                      onClick={() => setDeleteTarget(member)}
                      disabled={isSelf || member.role === 'admin'}
                      title={isSelf ? 'Không thể xóa tài khoản của chính bạn' : (member.role === 'admin' ? 'Không thể xóa tài khoản admin' : `Xóa ${member.name}`)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardTitle>Quyền theo vai trò</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { role: 'admin' as UserRole, label: 'Quản trị', perms: ['Tạo đơn hàng', 'Xem tồn kho', 'Nhập kho', 'Xem thống kê', 'Quản lý nhân sự'] },
              { role: 'barista' as UserRole, label: 'Nhân viên', perms: ['Tạo đơn hàng', 'Xem tồn kho'] },
            ].map(({ role, label, perms }) => (
              <div key={role} className={`rounded-lg border p-3 ${role === 'admin' ? 'border-coffee-200 bg-coffee-50 dark:border-coffee-800 dark:bg-coffee-900/10' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'}`}>
                <p className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                <ul className="space-y-1">
                  {perms.map((perm) => (
                    <li key={perm} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span className="text-emerald-500">-</span>{perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} />}
      {deleteTarget && <DeleteConfirm member={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </Card>
  );
}
