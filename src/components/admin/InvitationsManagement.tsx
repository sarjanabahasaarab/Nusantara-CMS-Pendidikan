import React, { useState } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Mail,
  Shield,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { UserInvitation, RoleName } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface InvitationsManagementProps {
  invitations: UserInvitation[];
}

export const InvitationsManagement: React.FC<InvitationsManagementProps> = ({ invitations }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    email: string;
    name: string;
    roles: RoleName[];
  }>({
    email: '',
    name: '',
    roles: ['GURU'],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'invitations.create');
  const allRoles = cmsStore.getRoles();

  const handleOpenCreate = () => {
    setFormData({
      email: '',
      name: '',
      roles: ['GURU'],
    });
    setGeneratedLink(null);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Alamat email tujuan valid wajib diisi.');
      return;
    }

    try {
      const inv = cmsStore.createInvitation(
        formData.email.trim(),
        formData.roles,
        user?.id || 'admin',
        formData.name.trim() || undefined,
        user
      );

      const host = window.location.origin;
      const link = `${host}/accept-invitation?token=${inv.token}`;
      setGeneratedLink(link);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menerbitkan undangan.');
    }
  };

  const handleCopyLink = (token: string, id: string) => {
    const host = window.location.origin;
    const link = `${host}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Batalkan tiket undangan registrasi ini?')) {
      cmsStore.revokeInvitation(id, user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Manajemen Undangan Pengguna (User Invitations)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Penerbitan token registrasi mandiri berbatas waktu bagi guru baru, staf, siswa, atau orang tua murid (Section M).
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Terbitkan Undangan Baru
          </Button>
        )}
      </div>

      {/* Tabel Undangan */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Email Calon Pengguna</th>
                <th className="p-3">Role yang Ditetapkan</th>
                <th className="p-3">Penerbit Undangan</th>
                <th className="p-3">Masa Berlaku</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Belum Ada Undangan"
                      description="Belum ada tiket undangan registrasi pengguna yang diterbitkan."
                    />
                  </td>
                </tr>
              ) : (
                invitations.map((item) => {
                  const isExpired = new Date(item.expiresAt) < new Date();
                  const currentStatus = isExpired && item.status === 'PENDING' ? 'EXPIRED' : item.status;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {item.email}
                        </div>
                        {item.name && <div className="text-slate-500 text-[11px] mt-0.5">{item.name}</div>}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {item.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-[10px] py-0 px-1.5">
                              {r.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {item.inviterName || 'Administrator'}
                      </td>

                      <td className="p-3 text-slate-500">
                        Hingga {formatDate(item.expiresAt)}
                      </td>

                      <td className="p-3">
                        {currentStatus === 'ACCEPTED' ? (
                          <Badge variant="success" className="gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Diterima
                          </Badge>
                        ) : currentStatus === 'PENDING' ? (
                          <Badge variant="warning" className="gap-1 text-[10px]">
                            <Clock className="w-3 h-3" />
                            Menunggu Aktivasi
                          </Badge>
                        ) : currentStatus === 'EXPIRED' ? (
                          <Badge variant="danger" className="text-[10px]">
                            Kedaluwarsa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 text-[10px]">
                            Dibatalkan
                          </Badge>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentStatus === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(item.token, item.id)}
                                className="text-xs h-7 px-2 gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedId === item.id ? 'Tersalin' : 'Salin Tautan'}
                              </Button>

                              <button
                                onClick={() => handleRevoke(item.id)}
                                title="Batalkan Tiket"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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

      {/* Modal Terbitkan Undangan */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Terbitkan Undangan Pengguna Baru"
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
              Alamat Email Calon Pengguna *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nama@nusantara.sch.id"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap (Opsional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Role yang Dialokasikan *
            </label>
            <select
              value={formData.roles[0] || 'GURU'}
              onChange={(e) => setFormData({ ...formData, roles: [e.target.value as RoleName] })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {allRoles.filter((r) => r.name !== 'SUPER_ADMIN').map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {generatedLink ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 space-y-2">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Undangan Berhasil Diterbitkan!
              </p>
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded font-mono text-[11px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  alert('Tautan berhasil disalin!');
                }}
                className="w-full"
              >
                Salin Tautan Aktivasi
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
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
