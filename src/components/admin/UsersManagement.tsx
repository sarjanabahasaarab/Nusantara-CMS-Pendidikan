import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  Lock,
  Unlock,
  Download,
  Upload,
  UserCheck,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { User, RoleName, Role, UserStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface UsersManagementProps {
  users: User[];
  roles: Role[];
  onNavigateTab?: (tab: string) => void;
}

type UserCategoryTab = 
  | 'ALL' 
  | 'ADMIN' 
  | 'KEPSEK' 
  | 'WAKASEK' 
  | 'GURU' 
  | 'WALI_KELAS' 
  | 'STAFF' 
  | 'SISWA' 
  | 'ORANG_TUA';

export const UsersManagement: React.FC<UsersManagementProps> = ({ users, roles, onNavigateTab }) => {
  const { user: currentUser } = useAuth();
  
  // Tab Kategori Submenu (Section B)
  const [activeTab, setActiveTab] = useState<UserCategoryTab>('ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED'>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Form Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    roles: RoleName[];
    role: RoleName;
    status: UserStatus;
  }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    roles: ['GURU'],
    role: 'GURU',
    status: 'ACTIVE',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userForReset, setUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Block modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Quick Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState<{ email: string; name: string; roles: RoleName[] }>({
    email: '',
    name: '',
    roles: ['GURU'],
  });
  const [inviteLinkGenerated, setInviteLinkGenerated] = useState<string | null>(null);

  const canCreate = hasPermission(currentUser, 'users.create');
  const canEdit = hasPermission(currentUser, 'users.update');
  const canDelete = hasPermission(currentUser, 'users.delete');
  const canBlock = hasPermission(currentUser, 'users.block');
  const canExport = hasPermission(currentUser, 'users.export');

  // Statistik Real
  const stats = useMemo(() => cmsStore.getUserStats(), [users]);

  // Filter Pengguna berdasarkan Tab Submenu & Status & Pencarian
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Filter Tab Submenu
      if (activeTab === 'ADMIN') {
        const hasAdmin = (u.roles || [u.role]).some((r) => ['SUPER_ADMIN', 'ADMIN_SEKOLAH', 'ADMIN'].includes(r));
        if (!hasAdmin) return false;
      } else if (activeTab === 'KEPSEK') {
        const hasKepsek = (u.roles || [u.role]).includes('KEPALA_SEKOLAH');
        if (!hasKepsek) return false;
      } else if (activeTab === 'WAKASEK') {
        const hasWakasek = (u.roles || [u.role]).includes('WAKIL_KEPALA_SEKOLAH');
        if (!hasWakasek) return false;
      } else if (activeTab === 'GURU') {
        const hasGuru = (u.roles || [u.role]).includes('GURU');
        if (!hasGuru) return false;
      } else if (activeTab === 'WALI_KELAS') {
        const hasWali = (u.roles || [u.role]).includes('WALI_KELAS');
        if (!hasWali) return false;
      } else if (activeTab === 'STAFF') {
        const hasStaff = (u.roles || [u.role]).some((r) =>
          ['TENAGA_ADMINISTRASI', 'BENDAHARA', 'PUSTAKAWAN', 'PETUGAS_SARPRAS', 'ADMIN_AKADEMIK', 'ADMIN_KESISWAAN'].includes(r)
        );
        if (!hasStaff) return false;
      } else if (activeTab === 'SISWA') {
        const hasSiswa = (u.roles || [u.role]).includes('SISWA');
        if (!hasSiswa) return false;
      } else if (activeTab === 'ORANG_TUA') {
        const hasOrtu = (u.roles || [u.role]).includes('ORANG_TUA');
        if (!hasOrtu) return false;
      }

      // 2. Filter Status
      if (statusFilter === 'ACTIVE' && (u.status === 'BLOCKED' || !u.isActive)) return false;
      if (statusFilter === 'INACTIVE' && (u.status !== 'INACTIVE' && u.isActive)) return false;
      if (statusFilter === 'BLOCKED' && u.status !== 'BLOCKED') return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.phone && u.phone.includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchRole) return false;
      }

      return true;
    });
  }, [users, activeTab, statusFilter, search]);

  // Paginated records
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      roles: ['GURU'],
      role: 'GURU',
      status: 'ACTIVE',
    });
    setErrorMessage(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (userItem: User) => {
    setEditingUser(userItem);
    const assignedRoles = Array.isArray(userItem.roles) && userItem.roles.length > 0
      ? userItem.roles
      : [userItem.role];

    setFormData({
      name: userItem.name,
      email: userItem.email,
      password: '',
      phone: userItem.phone || '',
      roles: assignedRoles,
      role: userItem.role,
      status: userItem.status || (userItem.isActive ? 'ACTIVE' : 'INACTIVE'),
    });
    setErrorMessage(null);
    setFormModalOpen(true);
  };

  const handleToggleRoleCheckbox = (roleName: RoleName) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(roleName);
      let newRoles: RoleName[];
      if (exists) {
        if (prev.roles.length === 1) return prev; // Minimal 1 role
        newRoles = prev.roles.filter((r) => r !== roleName);
      } else {
        newRoles = [...prev.roles, roleName];
      }
      return {
        ...prev,
        roles: newRoles,
        role: newRoles[0] || prev.role,
      };
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Alamat email valid wajib diisi.');
      return;
    }

    try {
      if (editingUser) {
        cmsStore.updateUser(
          editingUser.id,
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            roles: formData.roles,
            role: formData.roles[0],
            status: formData.status,
            isActive: formData.status === 'ACTIVE',
            ...(formData.password ? { password: formData.password } : {}),
          },
          currentUser
        );
      } else {
        if (!formData.password || formData.password.length < 6) {
          setErrorMessage('Kata sandi minimal 6 karakter.');
          return;
        }
        cmsStore.createUser(
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            password: formData.password,
            roles: formData.roles,
            role: formData.roles[0],
            status: formData.status,
            isActive: formData.status === 'ACTIVE',
          },
          currentUser
        );
      }

      setFormModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data pengguna.');
    }
  };

  const handleDeleteUser = (userItem: User) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan pengguna "${userItem.name}"? Data riwayat tetap tersimpan rapi.`)) {
      try {
        cmsStore.deleteUser(userItem.id, currentUser);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus pengguna.');
      }
    }
  };

  const handleOpenBlockModal = (userItem: User) => {
    setUserToBlock(userItem);
    setBlockReason('Pelanggaran kedisiplinan / keamanan');
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (!userToBlock) return;
    try {
      cmsStore.blockUser(userToBlock.id, blockReason, currentUser);
      setBlockModalOpen(false);
      setUserToBlock(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memblokir pengguna.');
    }
  };

  const handleUnblock = (userItem: User) => {
    if (confirm(`Buka blokir untuk pengguna "${userItem.name}"?`)) {
      try {
        cmsStore.unblockUser(userItem.id, currentUser);
      } catch (err: any) {
        alert(err.message || 'Gagal membuka blokir pengguna.');
      }
    }
  };

  const handleOpenResetModal = (userItem: User) => {
    setUserForReset(userItem);
    setNewPassword('Nusantara123!');
    setResetSuccessNotice(null);
    setResetModalOpen(true);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForReset) return;

    try {
      cmsStore.resetUserPassword(userForReset.id, newPassword, currentUser);
      setResetSuccessNotice(`Kata sandi untuk ${userForReset.name} berhasil diperbarui.`);
      setTimeout(() => {
        setResetModalOpen(false);
        setUserForReset(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal mereset kata sandi.');
    }
  };

  // Bulk Actions
  const handleBulkActivate = () => {
    selectedUserIds.forEach((id) => {
      cmsStore.updateUser(id, { status: 'ACTIVE', isActive: true }, currentUser);
    });
    setSelectedUserIds([]);
  };

  const handleBulkDeactivate = () => {
    selectedUserIds.forEach((id) => {
      cmsStore.updateUser(id, { status: 'INACTIVE', isActive: false }, currentUser);
    });
    setSelectedUserIds([]);
  };

  const handleExportCsv = () => {
    const csvContent = cmsStore.exportUsersCsv(activeTab === 'ALL' ? undefined : activeTab);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pengguna-nusantara-${activeTab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.email.includes('@')) {
      alert('Alamat email undangan tidak valid.');
      return;
    }
    try {
      const inv = cmsStore.createInvitation(inviteData.email, inviteData.roles, currentUser?.id || 'admin', inviteData.name, currentUser);
      const host = window.location.origin;
      const link = `${host}/accept-invitation?token=${inv.token}`;
      setInviteLinkGenerated(link);
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan undangan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Manajemen Pengguna & Kelembagaan
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Direktori terpusat sivitas akademika: pimpinan, guru, wali kelas, tenaga kependidikan, siswa, dan orang tua.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Export CSV
            </Button>
          )}

          {canCreate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInviteData({ email: '', name: '', roles: ['GURU'] });
                  setInviteLinkGenerated(null);
                  setInviteModalOpen(true);
                }}
                className="gap-1.5"
              >
                <Send className="w-4 h-4 text-emerald-600" />
                Undang Pengguna
              </Button>

              <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
                <UserPlus className="w-4 h-4" />
                Tambah Pengguna
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Statistik Real Ringkas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Total Akun</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalUsers}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Administrator</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{stats.adminCount}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Kepala Sekolah</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{stats.kepsekCount}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Guru & Pendidik</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.teacherCount}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Siswa Aktif</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{stats.studentCount}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Orang Tua/Wali</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{stats.parentCount}</p>
        </Card>
        <Card className="p-3 text-center border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Tenaga Kependidikan</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{stats.staffCount}</p>
        </Card>
      </div>

      {/* 3. Submenu Tabs (Section B) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'ALL', label: 'Semua Pengguna' },
          { id: 'ADMIN', label: 'Administrator' },
          { id: 'KEPSEK', label: 'Kepala Sekolah' },
          { id: 'WAKASEK', label: 'Wakil Kepala Sekolah' },
          { id: 'GURU', label: 'Guru' },
          { id: 'WALI_KELAS', label: 'Wali Kelas' },
          { id: 'STAFF', label: 'Tenaga Kependidikan' },
          { id: 'SISWA', label: 'Siswa' },
          { id: 'ORANG_TUA', label: 'Orang Tua / Wali' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as UserCategoryTab);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Filter, Search & Bulk Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, no HP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="BLOCKED">Diblokir</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              {selectedUserIds.length} dipilih:
            </span>
            <Button size="sm" variant="outline" onClick={handleBulkActivate} className="text-xs h-7 px-2">
              Aktifkan
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDeactivate} className="text-xs h-7 px-2 text-rose-600">
              Nonaktifkan
            </Button>
          </div>
        )}
      </div>

      {/* 5. Tabel Direktori Pengguna */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedUsers.length > 0 && selectedUserIds.length === paginatedUsers.length}
                    className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3">Pengguna & Kontak</th>
                <th className="p-3">Role & Hak Akses</th>
                <th className="p-3">Status</th>
                <th className="p-3">Terakhir Login</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Tidak Ada Pengguna"
                      description="Tidak ditemukan pengguna yang sesuai dengan kriteria filter saat ini."
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((item) => {
                  const assignedRoles = Array.isArray(item.roles) && item.roles.length > 0
                    ? item.roles
                    : [item.role];
                  const isBlocked = item.status === 'BLOCKED';
                  const isSuper = assignedRoles.includes('SUPER_ADMIN');

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        selectedUserIds.includes(item.id) ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop'}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {item.name}
                              {isSuper && (
                                <Badge variant="purple" className="text-[10px] py-0 px-1 font-mono">
                                  CORE
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {item.email}
                              </span>
                              {item.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {item.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {assignedRoles.map((r) => (
                            <Badge
                              key={r}
                              variant={
                                r === 'SUPER_ADMIN'
                                  ? 'purple'
                                  : r === 'ADMIN_SEKOLAH' || r === 'ADMIN'
                                  ? 'blue'
                                  : r === 'KEPALA_SEKOLAH'
                                  ? 'warning'
                                  : r === 'GURU' || r === 'WALI_KELAS'
                                  ? 'green'
                                  : r === 'SISWA'
                                  ? 'amber'
                                  : 'default'
                              }
                              className="text-[10px] py-0.5"
                            >
                              {r.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="p-3">
                        {isBlocked ? (
                          <Badge variant="danger" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Diblokir
                          </Badge>
                        ) : item.isActive ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">
                            Nonaktif
                          </Badge>
                        )}
                      </td>

                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {item.lastLoginAt ? formatDate(item.lastLoginAt) : 'Belum pernah login'}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenResetModal(item)}
                            title="Reset Kata Sandi"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock */}
                          {canBlock && !isSuper && (
                            isBlocked ? (
                              <button
                                onClick={() => handleUnblock(item)}
                                title="Buka Blokir Akun"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenBlockModal(item)}
                                title="Blokir Akun"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}

                          {/* Edit User */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Pengguna"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete/Archive */}
                          {canDelete && !isSuper && (
                            <button
                              onClick={() => handleDeleteUser(item)}
                              title="Nonaktifkan Akun"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} -{' '}
              {Math.min(currentPage * pageSize, filteredUsers.length)} dari {filteredUsers.length} pengguna
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-medium text-slate-900 dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 7. Modal Form Tambah / Edit Pengguna (Multi-Role Support) */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingUser ? `Edit Akun Pengguna: ${editingUser.name}` : 'Tambah Pengguna Baru'}
        className="max-w-xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap & Gelar *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Cth: Ahmad Fauzi, S.Pd / Dra. Hj. Ratna Juwita, M.Pd"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email (Unik) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@nusantara.sch.id"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812-3456-7890"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {editingUser ? 'Kata Sandi Baru (Kosongkan bila tidak diubah)' : 'Kata Sandi Awal *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Multi-Role Assignment Checkboxes (Section D & K) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alokasi Peran / Multi-Role (Dapat memilih lebih dari satu peran) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
              {roles.map((r) => {
                const checked = formData.roles.includes(r.name);
                return (
                  <label key={r.id} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleRoleCheckbox(r.name)}
                      className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{r.name.replace(/_/g, ' ')}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status Akun */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status Akun
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ACTIVE">Aktif (Dapat Login)</option>
              <option value="INACTIVE">Nonaktif (Login Ditolak)</option>
              <option value="BLOCKED">Diblokir Sementara</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Modal Reset Kata Sandi */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Kata Sandi: ${userForReset?.name}`}
      >
        <form onSubmit={handleSaveResetPassword} className="space-y-4">
          {resetSuccessNotice ? (
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetSuccessNotice}</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Masukkan kata sandi baru untuk akun pengguna ini. Pengguna dapat login kembali dengan kata sandi tersebut.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru *
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Kata Sandi
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* 9. Modal Blokir Akun */}
      <Modal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title={`Konfirmasi Pemblokiran Akun`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            Apakah Anda yakin ingin memblokir akses login akun <strong>{userToBlock?.name}</strong> ({userToBlock?.email})?
          </p>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Pemblokiran (Akan dicatat di Jejak Audit)
            </label>
            <textarea
              rows={2}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setBlockModalOpen(false)}>
              Batal
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={handleConfirmBlock}>
              Ya, Blokir Akun
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. Modal Undang Pengguna (Section M) */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Kirim Undangan Registrasi Mandiri"
      >
        <form onSubmit={handleCreateInvite} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sistem akan menerbitkan token registrasi terenkripsi dengan masa berlaku 7 hari. Pengguna dapat membuat kata sandi mandiri melalui tautan tersebut.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email Tujuan *
            </label>
            <input
              type="email"
              required
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              placeholder="calon.guru@example.sch.id"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Calon Pengguna (Opsional)
            </label>
            <input
              type="text"
              value={inviteData.name}
              onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
              placeholder="Nama lengkap"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role yang Ditetapkan
            </label>
            <select
              value={inviteData.roles[0] || 'GURU'}
              onChange={(e) => setInviteData({ ...inviteData, roles: [e.target.value as RoleName] })}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {roles.filter((r) => r.name !== 'SUPER_ADMIN').map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {inviteLinkGenerated ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 space-y-2">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Tiket Undangan Berhasil Dibuat!
              </p>
              <input
                type="text"
                readOnly
                value={inviteLinkGenerated}
                className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLinkGenerated);
                  alert('Tautan undangan berhasil disalin ke papan klip!');
                }}
                className="w-full text-xs"
              >
                Salin Tautan Undangan
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Terbitkan Undangan
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
