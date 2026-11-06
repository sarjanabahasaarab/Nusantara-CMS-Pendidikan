import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StaffProfile, EmploymentStatus } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface StaffProfileManagementProps {
  staffList: StaffProfile[];
}

export const StaffProfileManagement: React.FC<StaffProfileManagementProps> = ({ staffList }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    employeeNumber: string;
    department: string;
    position: string;
    employmentStatus: EmploymentStatus;
    phone: string;
    address: string;
    startDate: string;
  }>({
    fullName: '',
    email: '',
    employeeNumber: '',
    department: 'Tata Usaha',
    position: 'Staf Tata Usaha',
    employmentStatus: 'TETAP_YAYASAN',
    phone: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'staff.create');
  const canEdit = hasPermission(user, 'staff.update');
  const canDelete = hasPermission(user, 'staff.delete');

  const departments = Array.from(new Set(staffList.map((s) => s.department).filter(Boolean)));

  const allUsers = cmsStore.getUsers();

  const filtered = staffList.filter((s) => {
    const matchDept = deptFilter === 'ALL' || s.department === deptFilter;
    const q = search.toLowerCase();
    const userMatch = allUsers.find((u) => u.id === s.userId);
    const userName = userMatch ? userMatch.name.toLowerCase() : '';

    const matchSearch =
      !q ||
      userName.includes(q) ||
      s.employeeNumber.toLowerCase().includes(q) ||
      s.position.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q);

    return matchDept && matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      email: '',
      employeeNumber: `PEG-${Date.now().toString().slice(-6)}`,
      department: 'Tata Usaha',
      position: 'Staf Tata Usaha',
      employmentStatus: 'TETAP_YAYASAN',
      phone: '',
      address: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: StaffProfile) => {
    setEditingStaff(item);
    const linkedUser = allUsers.find((u) => u.id === item.userId);

    setFormData({
      fullName: linkedUser ? linkedUser.name : '',
      email: linkedUser ? linkedUser.email : '',
      employeeNumber: item.employeeNumber,
      department: item.department,
      position: item.position,
      employmentStatus: item.employmentStatus,
      phone: item.phone,
      address: item.address,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.employeeNumber.trim()) {
      setErrorMessage('Nama, email, dan nomor pegawai wajib diisi.');
      return;
    }

    try {
      if (editingStaff) {
        cmsStore.updateStaffProfile(
          editingStaff.id,
          {
            employeeNumber: formData.employeeNumber.trim(),
            department: formData.department.trim(),
            position: formData.position.trim(),
            employmentStatus: formData.employmentStatus,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
          },
          user
        );

        // Update user nama jika berubah
        if (editingStaff.userId) {
          cmsStore.updateUser(
            editingStaff.userId,
            { name: formData.fullName.trim(), phone: formData.phone.trim() },
            user
          );
        }
      } else {
        let existingUser = cmsStore.getUserByEmail(formData.email);
        if (!existingUser) {
          existingUser = cmsStore.createUser(
            {
              name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: 'TENAGA_ADMINISTRASI',
              roles: ['TENAGA_ADMINISTRASI'],
              status: 'ACTIVE',
            },
            user
          );
        }

        cmsStore.createStaffProfile(
          {
            userId: existingUser.id,
            employeeNumber: formData.employeeNumber.trim(),
            department: formData.department.trim(),
            position: formData.position.trim(),
            employmentStatus: formData.employmentStatus,
            startDate: formData.startDate,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            isActive: true,
          },
          user
        );
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data staf.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Struktur Tenaga Kependidikan (Staff)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pengelolaan pegawai penunjang: Tata Usaha, Operator Sekolah, Bendahara, Pustakawan, Sarpras, dan Laboran.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tambah Data Staf
          </Button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, unit kerja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">Semua Unit Kerja</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Staf */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Nama Pegawai & Kontak</th>
                <th className="p-3">Nomor Pegawai</th>
                <th className="p-3">Jabatan & Unit Kerja</th>
                <th className="p-3">Status Kerja</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState
                      title="Tidak Ada Data Staf"
                      description="Belum ada data tenaga kependidikan yang sesuai dengan kriteria filter."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const linkedUser = allUsers.find((u) => u.id === item.userId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {linkedUser ? linkedUser.name : 'Pegawai'}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-3 mt-0.5">
                          {linkedUser && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {linkedUser.email}
                            </span>
                          )}
                          <span>{item.phone}</span>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {item.employeeNumber}
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">{item.position}</div>
                        <div className="text-slate-500 text-[11px]">Unit: {item.department}</div>
                      </td>

                      <td className="p-3">
                        <Badge
                          variant={
                            item.employmentStatus === 'PNS'
                              ? 'blue'
                              : item.employmentStatus === 'TETAP_YAYASAN'
                              ? 'purple'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {item.employmentStatus.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Data Staf"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
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
      </Card>

      {/* Modal Form Staf */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? `Edit Data Staf` : 'Tambah Tenaga Kependidikan Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Pegawai *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Dewi Lestari, A.Md"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staf@nusantara.sch.id"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Pegawai / NIK *
              </label>
              <input
                type="text"
                required
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                placeholder="PEG-2024-001"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Kerja / Bagian *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Tata Usaha / Keuangan / Perpustakaan"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan / Posisi Tugas *
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Cth: Bendahara Sekolah / Kepala Pustakawan"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Data Staf
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
