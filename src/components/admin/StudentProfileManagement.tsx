import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { StudentProfile, StudentStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface StudentProfileManagementProps {
  students: StudentProfile[];
}

export const StudentProfileManagement: React.FC<StudentProfileManagementProps> = ({ students }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    nis: string;
    nisn: string;
    className: string;
    gender: 'L' | 'P';
    religion: string;
    birthPlace: string;
    birthDate: string;
    address: string;
    status: StudentStatus;
    entryDate: string;
  }>({
    fullName: '',
    email: '',
    phone: '',
    nis: '',
    nisn: '',
    className: 'X-A',
    gender: 'L',
    religion: 'Islam',
    birthPlace: 'Indonesia',
    birthDate: '2009-01-01',
    address: '',
    status: 'AKTIF',
    entryDate: new Date().toISOString().split('T')[0],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'students.create');
  const canEdit = hasPermission(user, 'students.update');
  const canDelete = hasPermission(user, 'students.delete');

  const studentParents = cmsStore.getStudentParents();

  // Dapatkan daftar kelas unik
  const classList = Array.from(new Set(students.map((s) => s.className).filter(Boolean))) as string[];

  const filtered = students.filter((s) => {
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchClass = classFilter === 'ALL' || s.className === classFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.nis.includes(q) ||
      (s.nisn && s.nisn.includes(q)) ||
      (s.className && s.className.toLowerCase().includes(q));

    return matchStatus && matchClass && matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      nis: '',
      nisn: '',
      className: 'X-A',
      gender: 'L',
      religion: 'Islam',
      birthPlace: 'Indonesia',
      birthDate: '2009-01-01',
      address: '',
      status: 'AKTIF',
      entryDate: new Date().toISOString().split('T')[0],
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: StudentProfile) => {
    setEditingStudent(item);
    setFormData({
      fullName: item.fullName,
      email: item.email || '',
      phone: item.phone || '',
      nis: item.nis,
      nisn: item.nisn || '',
      className: item.className || 'X-A',
      gender: item.gender,
      religion: item.religion,
      birthPlace: item.birthPlace,
      birthDate: item.birthDate ? item.birthDate.split('T')[0] : '2009-01-01',
      address: item.address,
      status: item.status,
      entryDate: item.entryDate ? item.entryDate.split('T')[0] : '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.nis.trim()) {
      setErrorMessage('Nama lengkap dan NIS (Nomor Induk Siswa) wajib diisi.');
      return;
    }

    try {
      if (editingStudent) {
        cmsStore.updateStudentProfile(
          editingStudent.id,
          {
            ...formData,
            nis: formData.nis.trim(),
            nisn: formData.nisn.trim() || undefined,
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim() || undefined,
          },
          user
        );
      } else {
        const studentEmail = formData.email.trim() || `siswa.${formData.nis.trim()}@nusantara.sch.id`;

        let existingUser = cmsStore.getUserByEmail(studentEmail);
        if (!existingUser) {
          existingUser = cmsStore.createUser(
            {
              name: formData.fullName.trim(),
              email: studentEmail,
              phone: formData.phone.trim() || undefined,
              role: 'SISWA',
              roles: ['SISWA'],
              status: 'ACTIVE',
            },
            user
          );
        }

        cmsStore.createStudentProfile(
          {
            ...formData,
            userId: existingUser.id,
            nis: formData.nis.trim(),
            nisn: formData.nisn.trim() || undefined,
            email: studentEmail,
            phone: formData.phone.trim() || undefined,
          },
          user
        );
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan profil siswa.');
    }
  };

  const handleDelete = (item: StudentProfile) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan/mengarsipkan data siswa "${item.fullName}" (NIS: ${item.nis})? Riwayat akademik akan tetap terlindungi.`)) {
      cmsStore.deleteStudentProfile(item.id, user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Buku Induk & Profil Peserta Didik (Siswa)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Data kesiswaan, NIS/NISN unik, penempatan rombongan belajar, dan verifikasi perwalian orang tua murid.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tambah Data Siswa
          </Button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, NISN, kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">Semua Kelas / Rombel</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">Semua Status Siswa</option>
            <option value="AKTIF">Aktif</option>
            <option value="PINDAH">Pindah / Mutasi</option>
            <option value="LULUS">Lulus / Alumni</option>
            <option value="KELUAR">Keluar</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Tabel Siswa */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Nama Peserta Didik</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Rombel / Kelas</th>
                <th className="p-3">Wali Murid Terhubung</th>
                <th className="p-3">Status Kesiswaan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Tidak Ada Data Siswa"
                      description="Belum ada data peserta didik yang cocok dengan kriteria filter."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const linkedParents = cmsStore.getParentsByStudentId(item.id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop'}
                            alt={item.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {item.fullName}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>JK: {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                              <span>•</span>
                              <span>Masuk: {item.entryDate ? item.entryDate.split('-')[0] : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">NIS: {item.nis}</div>
                        <div className="text-slate-500">NISN: {item.nisn || '-'}</div>
                      </td>

                      <td className="p-3">
                        <Badge variant="blue" className="text-xs font-semibold px-2">
                          {item.className || 'Belum Dipetakan'}
                        </Badge>
                      </td>

                      <td className="p-3">
                        {linkedParents.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {linkedParents.map((rel) => (
                              <div key={rel.id} className="flex items-center gap-1.5 text-[11px]">
                                <Badge variant="outline" className="text-[9px] py-0 px-1">
                                  {rel.relationship}
                                </Badge>
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                  {rel.parent.fullName}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum terhubung</span>
                        )}
                      </td>

                      <td className="p-3">
                        <Badge
                          variant={
                            item.status === 'AKTIF'
                              ? 'success'
                              : item.status === 'LULUS'
                              ? 'purple'
                              : item.status === 'PINDAH'
                              ? 'warning'
                              : 'danger'
                          }
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Profil Siswa"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item)}
                              title="Arsipkan Siswa"
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
      </Card>

      {/* Modal Form Profil Siswa */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? `Edit Profil Siswa: ${editingStudent.fullName}` : 'Tambah Profil Siswa Baru'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Muhammad Rizky Pratama"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas / Rombel *
              </label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="Cth: X-A / XI-MIPA-1"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIS (Nomor Induk Siswa Sekolah) *
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="2024001"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NISN (Nasional - Opsional)
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="0071234567"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agama
              </label>
              <input
                type="text"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                placeholder="Islam"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Kesiswaan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="AKTIF">Aktif</option>
                <option value="PINDAH">Pindah / Mutasi</option>
                <option value="LULUS">Lulus / Tamat</option>
                <option value="KELUAR">Keluar</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Tempat Tinggal
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat domisili peserta didik..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Data Siswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
