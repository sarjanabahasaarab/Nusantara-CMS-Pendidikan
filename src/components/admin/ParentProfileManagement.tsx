import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  Briefcase,
  Home,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Unlink,
} from 'lucide-react';
import { ParentProfile, StudentProfile, ParentRelationship } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface ParentProfileManagementProps {
  parents: ParentProfile[];
}

export const ParentProfileManagement: React.FC<ParentProfileManagementProps> = ({ parents }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentProfile | null>(null);

  // Relasi Link Siswa Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedParentForLink, setSelectedParentForLink] = useState<ParentProfile | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState<ParentRelationship>('IBU');
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);
  const [canViewAcademic, setCanViewAcademic] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
    isActive: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'parents.create');
  const canEdit = hasPermission(user, 'parents.update');
  const canDelete = hasPermission(user, 'parents.delete');

  const allStudents = cmsStore.getStudentProfiles();

  const filtered = parents.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.occupation.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingParent(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      occupation: '',
      address: '',
      isActive: true,
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ParentProfile) => {
    setEditingParent(item);
    setFormData({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      occupation: item.occupation,
      address: item.address,
      isActive: item.isActive,
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Nama, email, dan nomor telepon wajib diisi.');
      return;
    }

    try {
      if (editingParent) {
        cmsStore.updateParentProfile(
          editingParent.id,
          {
            ...formData,
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
          },
          user
        );
      } else {
        let existingUser = cmsStore.getUserByEmail(formData.email);
        if (!existingUser) {
          existingUser = cmsStore.createUser(
            {
              name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: 'ORANG_TUA',
              roles: ['ORANG_TUA'],
              status: 'ACTIVE',
            },
            user
          );
        }

        cmsStore.createParentProfile(
          {
            ...formData,
            userId: existingUser.id,
          },
          user
        );
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data orang tua.');
    }
  };

  const handleOpenLinkModal = (parent: ParentProfile) => {
    setSelectedParentForLink(parent);
    setSelectedStudentId(allStudents[0]?.id || '');
    setSelectedRelationship('IBU');
    setIsPrimaryContact(true);
    setCanViewAcademic(true);
    setLinkModalOpen(true);
  };

  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentForLink || !selectedStudentId) return;

    cmsStore.linkStudentParent(
      selectedStudentId,
      selectedParentForLink.id,
      selectedRelationship,
      isPrimaryContact,
      canViewAcademic,
      user
    );

    setLinkModalOpen(false);
  };

  const handleUnlink = (relId: string) => {
    if (confirm('Lepaskan relasi perwalian anak ini?')) {
      cmsStore.unlinkStudentParent(relId, user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            Direktori Orang Tua & Wali Murid
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Data kontak wali murid, profesi, dan pemetaan relasi keluarga dengan siswa sekolah (Section H).
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Tambah Profil Orang Tua
          </Button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, no HP, pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Tabel Orang Tua */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Nama Lengkap & Kontak</th>
                <th className="p-3">Profesi / Pekerjaan</th>
                <th className="p-3">Siswa / Anak Terhubung</th>
                <th className="p-3">Alamat Domisili</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState
                      title="Tidak Ada Data Orang Tua"
                      description="Belum ada data orang tua yang cocok dengan pencarian Anda."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const linkedStudents = cmsStore.getStudentsByParentId(item.id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.fullName}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {item.phone}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.occupation}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          {linkedStudents.length > 0 ? (
                            linkedStudents.map((rel) => (
                              <div
                                key={rel.id}
                                className="flex items-center justify-between gap-2 p-1 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 max-w-xs"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Badge
                                    variant={rel.relationship === 'IBU' ? 'purple' : 'blue'}
                                    className="text-[9px] py-0 px-1"
                                  >
                                    {rel.relationship}
                                  </Badge>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {rel.student.fullName}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">({rel.student.className})</span>
                                </div>
                                <button
                                  onClick={() => handleUnlink(rel.id)}
                                  title="Lepas Relasi"
                                  className="text-slate-400 hover:text-rose-600 p-0.5"
                                >
                                  <Unlink className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum terhubung ke siswa</span>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenLinkModal(item)}
                            className="text-[10px] h-6 px-2 gap-1 text-emerald-600 mt-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Hubungkan Anak
                          </Button>
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {item.address}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Profil Orang Tua"
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

      {/* Modal Form Profil Orang Tua */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? `Edit Profil: ${editingParent.fullName}` : 'Tambah Profil Orang Tua Baru'}
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
              Nama Lengkap Orang Tua / Wali *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ibu Hj. Kartika Dewi, S.E"
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
                placeholder="ortu@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 811-..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pekerjaan / Jabatan
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Cth: Wiraswasta / Pegawai Negeri / Akuntan"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Domisili
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat rumah tempat tinggal..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hubungkan Anak (Section H: StudentParent Relation) */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title={`Hubungkan Anak dengan: ${selectedParentForLink?.fullName}`}
      >
        <form onSubmit={handleConfirmLink} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Peserta Didik (Siswa) *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.className} - NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hubungan Keluarga (Relationship) *
            </label>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="AYAH">Ayah Kandung</option>
              <option value="IBU">Ibu Kandung</option>
              <option value="WALI">Wali Murid</option>
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimaryContact}
                onChange={(e) => setIsPrimaryContact(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Kontak Utama Sekolah (Primary Contact untuk Notifikasi Penting)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canViewAcademic}
                onChange={(e) => setCanViewAcademic(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Izinkan Memantau Data Nilai & Raport Anak (Privacy Control)
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setLinkModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Hubungan Perwalian
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
