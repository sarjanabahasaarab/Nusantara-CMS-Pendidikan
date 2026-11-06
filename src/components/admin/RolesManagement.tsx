import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Lock,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Role, RoleName } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface RolesManagementProps {
  roles: Role[];
  onOpenPermissions?: (roleName: RoleName) => void;
}

export const RolesManagement: React.FC<RolesManagementProps> = ({ roles, onOpenPermissions }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'roles.create');
  const canEdit = hasPermission(user, 'roles.update');
  const canDelete = hasPermission(user, 'roles.delete');

  const allUsers = cmsStore.getUsers();

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'ACTIVE',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      status: role.status || 'ACTIVE',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage('Nama dan kode role wajib diisi.');
      return;
    }

    try {
      if (editingRole) {
        cmsStore.updateRole(
          editingRole.id,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            status: formData.status,
          },
          user
        );
      } else {
        cmsStore.createRole(
          {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim(),
            permissions: [],
            status: formData.status,
          },
          user
        );
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data role.');
    }
  };

  const handleDeleteRole = (role: Role) => {
    if (confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) {
      try {
        cmsStore.deleteRole(role.id, user);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus role.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Manajemen Role & Peran Institusi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Definisi jabatan, hierarki otoritas, dan peran fungsional dalam ekosistem pendidikan sekolah.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tambah Role Baru
          </Button>
        )}
      </div>

      {/* Grid of Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          // Hitung berapa user yang memegang role ini
          const userCount = allUsers.filter(
            (u) => u.role === role.code || (Array.isArray(u.roles) && u.roles.includes(role.code))
          ).length;

          const isSystem = role.isSystem || role.code === 'SUPER_ADMIN';

          return (
            <Card
              key={role.id}
              className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                        {role.name.replace(/_/g, ' ')}
                      </CardTitle>
                      <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
                        {role.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSystem ? (
                      <Badge variant="purple" className="text-[10px] py-0 px-1.5 gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        SISTEM
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        KUSTOM
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[32px] line-clamp-2">
                  {role.description || 'Tidak ada deskripsi rinci untuk peran ini.'}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{userCount} Pengguna Terikat</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {role.permissions.length} Izin Granular
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {onOpenPermissions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenPermissions(role.name)}
                      className="text-xs h-7 px-2.5 gap-1"
                    >
                      <KeyRound className="w-3 h-3 text-slate-500" />
                      Atur Izin
                    </Button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(role)}
                        title="Edit Role"
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && !isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        title="Hapus Role Kustom"
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Buat / Edit Role */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Tambah Role Kustom Baru'}
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Role *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Cth: Pembina OSIS / Koordinator Riset"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kode Unik Role (HURUF_KAPITAL_DENGAN_UNDERSCORE) *
            </label>
            <input
              type="text"
              required
              disabled={!!editingRole?.isSystem}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              placeholder="PEMBINA_OSIS"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Fungsi Jabatan
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan ruang lingkup wewenang dan tanggung jawab peran ini..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
