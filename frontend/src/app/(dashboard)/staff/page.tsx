'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Eye, EyeOff, Loader2, Plus, Trash2, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { CreateStaffDto, StaffMember, UserRole } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { useAuthStore } from '@/store/auth.store';

// ── Add Staff Modal ───────────────────────────────────────────────────────

function AddStaffModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateStaffDto>({
    name: '',
    email: '',
    password: '',
    role: 'barista',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateStaffDto>>({});

  const validate = () => {
    const e: Partial<CreateStaffDto> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập đầy đủ';
    if (!form.email.includes('@')) e.email = 'Cần có email hợp lệ';
    if (form.password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (dto: CreateStaffDto) => api.post('/users', dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`${res.data.name} đã được thêm với vai trò ${res.data.role}`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Thêm thành viên thất bại');
    },
  });

  const handleSubmit = () => {
    if (validate()) mutation.mutate(form);
  };

  const field = (label: string, key: keyof CreateStaffDto, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={key === 'password' ? (showPass ? 'text' : 'password') : type}
          value={form[key] as string}
          onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: undefined }); }}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coffee-500 ${
            errors[key] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        {key === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Thêm thành viên</p>
            <p className="text-xs text-gray-500 mt-0.5">Tài khoản mới sẽ có hiệu lực ngay</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {field('Họ và Tên', 'name')}
          {field('Email', 'email', 'email')}
          {field('Password', 'password', 'password')}

          {/* Role picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              {(['barista', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.role === r
                      ? r === 'admin'
                        ? 'bg-coffee-600 border-coffee-600 text-white'
                        : 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {r === 'admin' ? '👑 Admin' : '☕ Barista'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {form.role === 'admin'
                ? 'Toàn quyền truy cập'
                : 'Quyền truy cập hạn chế: tạo đơn hàng, xem tồn kho (chỉ đọc)'}
            </p>
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
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex-1 py-2 px-4 bg-coffee-600 hover:bg-coffee-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {mutation.isPending
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang thêm...</>
              : <><Plus className="w-3.5 h-3.5" /> Thêm nhân viên</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────

function DeleteConfirm({
  member, onClose,
}: {
  member: StaffMember; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.delete(`/users/${member.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`${member.name} removed`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove staff');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-xs p-6">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Xóa thành viên?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{member.name}</span> ({member.email}) sẽ mất quyền truy cập ngay lập tức.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

const ROLE_BADGE = {
  admin:   'bg-coffee-100 text-coffee-700 dark:bg-coffee-900/40 dark:text-coffee-300',
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

  const admins   = staff.filter((s) => s.role === 'admin');
  const baristas = staff.filter((s) => s.role === 'barista');

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nhân sự</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Quản lý thành viên
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân viên
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tổng nhân sự" value={staff.length} color="text-gray-900 dark:text-white" />
          <StatCard label="Admins" value={admins.length} color="text-coffee-600 dark:text-coffee-400" />
          <StatCard label="Nhân viên" value={baristas.length} color="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Staff list */}
        <Card>
          <CardHeader>
            <CardTitle>Thành viên</CardTitle>
            <span className="text-xs text-gray-400">{staff.length} tài khoản thành viên</span>
          </CardHeader>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">chưa có tài khoản thành viên nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-5">
              {staff.map((member) => {
                const isSelf = member.id === currentUser?.id;
                const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                const avatarColor = member.role === 'admin'
                  ? 'bg-coffee-100 dark:bg-coffee-900/40 text-coffee-700 dark:text-coffee-300'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';

                return (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                    </div>

                    {/* Role */}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${ROLE_BADGE[member.role]}`}>
                      {member.role === 'admin' ? '👑 Admin' : '☕ Barista'}
                    </span>

                    {/* Joined */}
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 hidden sm:block">
                      {new Date(member.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    {/* Delete — không cho xóa chính mình */}
                    <button
                      onClick={() => setDeleteTarget(member)}
                      disabled={isSelf}
                      title={isSelf ? 'Cannot delete your own account' : `Remove ${member.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Role permissions reference */}
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardTitle>Quyền vai trò</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { role: 'admin' as UserRole,   label: '👑 Admin',   perms: ['Tạo đơn hàng', 'Xem tồn kho', 'Chỉnh sửa kho', 'Xem doanh số', 'Quản lý nhân viên'] },
              { role: 'barista' as UserRole, label: '☕ Barista', perms: ['Tạo đơn hàng', 'Xem tồn kho'] },
            ].map(({ role, label, perms }) => (
              <div key={role} className={`p-3 rounded-lg border ${role === 'admin' ? 'border-coffee-200 dark:border-coffee-800 bg-coffee-50 dark:bg-coffee-900/10' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'}`}>
                <p className="text-xs font-semibold mb-2 text-gray-800 dark:text-gray-200">{label}</p>
                <ul className="space-y-1">
                  {perms.map((p) => (
                    <li key={p} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span>{p}
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
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </Card>
  );
}
