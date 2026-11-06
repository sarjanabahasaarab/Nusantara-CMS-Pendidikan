import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { HomeroomAssignment } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface HomeroomManagementProps {
  assignments: HomeroomAssignment[];
}

export const HomeroomManagement: React.FC<HomeroomManagementProps> = ({ assignments }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [academicYearFilter, setAcademicYearFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    teacherId: '',
    className: 'X-A',
    academicYearName: '2026/2027 Ganjil',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = hasPermission(user, 'homeroom.manage');

  const teachers = cmsStore.getTeacherProfiles().filter((t) => t.isActive);

  // Daftar tahun ajaran unik
  const academicYears = Array.from(new Set(assignments.map((a) => a.academicYearName).filter(Boolean)));

  const filtered = assignments.filter((a) => {
    return academicYearFilter === 'ALL' || a.academicYearName === academicYearFilter;
  });

  const handleOpenAssign = () => {
    setFormData({
      teacherId: teachers[0]?.id || '',
      className: 'X-A',
      academicYearName: '2026/2027 Ganjil',
      startDate: new Date().toISOString().split('T')[0],
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const teacher = teachers.find((t) => t.id === formData.teacherId);
    if (!teacher) {
      setErrorMessage('Pilih guru yang akan ditugaskan sebagai wali kelas.');
      return;
    }

    try {
      const classSlug = `cls-${formData.className.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const yearSlug = `ay-${formData.academicYearName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      cmsStore.createHomeroomAssignment(
        {
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          classId: classSlug,
          className: formData.className.trim(),
          academicYearId: yearSlug,
          academicYearName: formData.academicYearName.trim(),
          startDate: formData.startDate,
          isActive: true,
        },
        user
      );

      // Pastikan guru juga memiliki role WALI_KELAS di akunnya (Multi-Role)
      if (teacher.userId) {
        cmsStore.assignRoleToUser(teacher.userId, 'WALI_KELAS', user);
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menetapkan wali kelas.');
    }
  };

  const handleDeactivate = (item: HomeroomAssignment) => {
    if (confirm(`Nonaktifkan penugasan wali kelas ${item.teacherName} untuk ${item.className}?`)) {
      cmsStore.deactivateHomeroomAssignment(item.id, user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Penugasan Wali Kelas & Rombel
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Penetapan guru wali kelas per rombongan belajar dengan aturan pembatasan tunggal per tahun ajaran (Section I).
          </p>
        </div>

        {canManage && (
          <Button variant="primary" size="sm" onClick={handleOpenAssign} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tetapkan Wali Kelas Baru
          </Button>
        )}
      </div>

      {/* Filter Tahun Ajaran */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tahun Ajaran:
          </span>
          <select
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Periode Tahun Ajaran</option>
            {academicYears.map((ay) => (
              <option key={ay} value={ay}>
                {ay}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Penugasan */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Kelas / Rombel</th>
                <th className="p-3">Guru Wali Kelas</th>
                <th className="p-3">Tahun Ajaran</th>
                <th className="p-3">Tanggal Mulai</th>
                <th className="p-3">Status Penugasan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Belum Ada Penugasan"
                      description="Belum ada data penetapan wali kelas untuk kriteria tahun ajaran ini."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        Kelas {item.className}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.teacherName || 'Guru Terdaftar'}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                      {item.academicYearName}
                    </td>

                    <td className="p-3 text-slate-500">
                      {item.startDate ? item.startDate.split('T')[0] : '-'}
                    </td>

                    <td className="p-3">
                      {item.isActive ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif Bertugas
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">
                          Selesai / Nonaktif
                        </Badge>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {canManage && item.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(item)}
                          className="text-xs h-7 px-2 text-rose-600"
                        >
                          Nonaktifkan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Penetapan Wali Kelas */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Penetapan Wali Kelas Baru"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Guru Pembina *
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.major})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kelas / Rombel *
            </label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              placeholder="Cth: XII-MIPA-1 / XI-IPS-2 / X-A"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Periode Tahun Ajaran *
            </label>
            <input
              type="text"
              required
              value={formData.academicYearName}
              onChange={(e) => setFormData({ ...formData, academicYearName: e.target.value })}
              placeholder="2026/2027 Ganjil"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
            <strong>Aturan Sistem:</strong> Satu kelas hanya dapat memiliki 1 wali kelas aktif pada tahun ajaran yang sama.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Tetapkan Wali Kelas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
