import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  Award,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  FileBadge,
} from 'lucide-react';
import { TeacherProfile, EmploymentStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface TeacherProfileManagementProps {
  teachers: TeacherProfile[];
}

export const TeacherProfileManagement: React.FC<TeacherProfileManagementProps> = ({ teachers }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    nip: string;
    nuptk: string;
    birthPlace: string;
    birthDate: string;
    gender: 'L' | 'P';
    address: string;
    education: string;
    major: string;
    employmentStatus: EmploymentStatus;
    startDate: string;
    notes: string;
  }>({
    fullName: '',
    email: '',
    phone: '',
    nip: '',
    nuptk: '',
    birthPlace: '',
    birthDate: '1985-01-01',
    gender: 'L',
    address: '',
    education: 'S1',
    major: '',
    employmentStatus: 'HONORER',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'teachers.create');
  const canEdit = hasPermission(user, 'teachers.update');
  const canDelete = hasPermission(user, 'teachers.delete');

  const homeroomAssignments = cmsStore.getHomeroomAssignments().filter((h) => h.isActive);

  const filtered = teachers.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.employmentStatus === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.nip && t.nip.includes(q)) ||
      (t.major && t.major.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      nip: '',
      nuptk: '',
      birthPlace: 'Indonesia',
      birthDate: '1985-01-01',
      gender: 'L',
      address: '',
      education: 'S1',
      major: '',
      employmentStatus: 'HONORER',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: TeacherProfile) => {
    setEditingTeacher(item);
    setFormData({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      nip: item.nip || '',
      nuptk: item.nuptk || '',
      birthPlace: item.birthPlace,
      birthDate: item.birthDate ? item.birthDate.split('T')[0] : '1985-01-01',
      gender: item.gender,
      address: item.address,
      education: item.education,
      major: item.major,
      employmentStatus: item.employmentStatus,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      notes: item.notes || '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.major.trim()) {
      setErrorMessage('Nama, email, dan bidang studi keahlian wajib diisi.');
      return;
    }

    try {
      if (editingTeacher) {
        cmsStore.updateTeacherProfile(
          editingTeacher.id,
          {
            ...formData,
            nip: formData.nip.trim() || undefined,
            nuptk: formData.nuptk.trim() || undefined,
          },
          user
        );
      } else {
        // Cari user account yang cocok atau buat user baru jika belum ada
        let existingUser = cmsStore.getUserByEmail(formData.email);
        if (!existingUser) {
          existingUser = cmsStore.createUser(
            {
              name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: 'GURU',
              roles: ['GURU'],
              status: 'ACTIVE',
            },
            user
          );
        }

        cmsStore.createTeacherProfile(
          {
            ...formData,
            userId: existingUser.id,
            nip: formData.nip.trim() || undefined,
            nuptk: formData.nuptk.trim() || undefined,
            isActive: true,
          },
          user
        );
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan profil guru.');
    }
  };

  const handleDelete = (item: TeacherProfile) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data profil pendidik "${item.fullName}"?`)) {
      cmsStore.deleteTeacherProfile(item.id, user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Direktori Profil Tenaga Pendidik (Guru)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Data kepegawaian pendidik, NIP/NUPTK, kualifikasi ijazah, bidang studi mengajar, dan status wali kelas.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tambah Profil Guru
          </Button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, bidang studi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="ALL">Semua Status Kepegawaian</option>
          <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
          <option value="PPPK">PPPK</option>
          <option value="HONORER">Honorer</option>
          <option value="TETAP_YAYASAN">Tetap Yayasan</option>
          <option value="TIDAK_TETAP">Tidak Tetap</option>
        </select>
      </div>

      {/* Tabel Guru */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Identitas Pendidik</th>
                <th className="p-3">NIP / NUPTK</th>
                <th className="p-3">Bidang Studi & Ijazah</th>
                <th className="p-3">Status Kepegawaian</th>
                <th className="p-3">Wali Kelas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Tidak Ada Data Pendidik"
                      description="Belum ada profil guru yang sesuai dengan pencarian atau filter Anda."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const homeroom = homeroomAssignments.find((h) => h.teacherId === item.id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop'}
                            alt={item.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {item.fullName}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {item.email}
                              </span>
                              <span>•</span>
                              <span>{item.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <div>NIP: {item.nip || <span className="text-slate-400 font-sans italic">Belum ada</span>}</div>
                        <div className="text-slate-500">NUPTK: {item.nuptk || '-'}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">{item.major}</div>
                        <div className="text-slate-500 text-[11px]">Pendidikan Terakhir: {item.education}</div>
                      </td>

                      <td className="p-3">
                        <Badge
                          variant={
                            item.employmentStatus === 'PNS'
                              ? 'blue'
                              : item.employmentStatus === 'PPPK'
                              ? 'green'
                              : item.employmentStatus === 'TETAP_YAYASAN'
                              ? 'purple'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {item.employmentStatus.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="p-3">
                        {homeroom ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {homeroom.className}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 italic">Bukan Wali Kelas</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Profil Guru"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item)}
                              title="Hapus Profil"
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

      {/* Modal Form Profil Guru */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Profil Pendidik: ${editingTeacher.fullName}` : 'Tambah Profil Guru Baru'}
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
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ahmad Fauzi, S.Pd"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Sekolah *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guru@nusantara.sch.id"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812-..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP (Opsional jika belum ada)
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="198204152008..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NUPTK (Opsional)
              </label>
              <input
                type="text"
                value={formData.nuptk}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                placeholder="16 digit angka"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bidang Studi Keahlian *
              </label>
              <input
                type="text"
                required
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="Cth: Fisika / Matematika"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pendidikan Terakhir
              </label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="S1">S1 (Sarjana)</option>
                <option value="S2">S2 (Magister)</option>
                <option value="S3">S3 (Doktor)</option>
                <option value="D3">D3 (Diploma)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Kepegawaian *
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="HONORER">Honorer</option>
                <option value="TETAP_YAYASAN">Tetap Yayasan</option>
                <option value="TIDAK_TETAP">Tidak Tetap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Tugas Tambahan
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Cth: Pembina Ekstrakurikuler Robotika, Kepala Laboratorium Komputer"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Profil Pendidik
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
