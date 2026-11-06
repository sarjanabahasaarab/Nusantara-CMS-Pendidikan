import React, { useState } from 'react';
import {
  Navigation,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import { NavigationMenu, ActiveNav } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface MenuManagementProps {
  menus: NavigationMenu[];
  onNavigate: (nav: ActiveNav) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menus,
  onNavigate,
}) => {
  const { user } = useAuth();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavigationMenu | null>(null);

  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<NavigationMenu | null>(null);

  const canManage = hasPermission(user, 'menus.manage');

  const rootMenus = menus.filter((m) => !m.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const getSubmenus = (parentId: string) =>
    menus.filter((m) => m.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const openCreateModal = () => {
    setEditingMenu(null);
    setLabel('');
    setUrl('/');
    setParentId('');
    setTarget('_self');
    setIsActive(true);
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (m: NavigationMenu) => {
    setEditingMenu(m);
    setLabel(m.label);
    setUrl(m.url);
    setParentId(m.parentId || '');
    setTarget(m.target);
    setIsActive(m.isActive);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!label.trim() || !url.trim()) {
      setErrorMessage('Label menu dan URL tautan wajib diisi.');
      return;
    }

    try {
      if (editingMenu) {
        if (parentId && !cmsStore.validateMenuNoCycle(editingMenu.id, parentId)) {
          setErrorMessage('Siklus terdeteksi: Menu anak tidak dapat dijadikan induk.');
          return;
        }

        cmsStore.updateMenu(
          editingMenu.id,
          {
            label: label.trim(),
            url: url.trim(),
            parentId: parentId || null,
            target,
            isActive,
          },
          user
        );
      } else {
        const siblings = parentId ? getSubmenus(parentId) : rootMenus;
        cmsStore.createMenu(
          {
            label: label.trim(),
            url: url.trim(),
            parentId: parentId || null,
            target,
            sortOrder: siblings.length + 1,
            isActive,
          },
          user
        );
      }
      setModalOpen(false);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyimpan menu');
    }
  };

  const handleMoveOrder = (item: NavigationMenu, direction: 'up' | 'down') => {
    const siblings = item.parentId ? getSubmenus(item.parentId) : rootMenus;
    const currentIndex = siblings.findIndex((s) => s.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const targetItem = siblings[targetIndex];

    const updates = [
      { id: item.id, sortOrder: targetItem.sortOrder, parentId: item.parentId },
      { id: targetItem.id, sortOrder: item.sortOrder, parentId: targetItem.parentId },
    ];

    cmsStore.reorderMenus(updates, user);
  };

  const handleConfirmDelete = () => {
    if (menuToDelete) {
      cmsStore.deleteMenu(menuToDelete.id, user);
      setDeleteModalOpen(false);
      setMenuToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            <span>Penyusun Menu Navigasi Website (Menu Builder)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur struktur pohon navigasi utama, sub-menu dropdown, urutan tampilan, dan target tautan tab baru.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item Menu</span>
          </Button>
        )}
      </div>

      {/* Main Builder Tree Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>Struktur Susunan Menu Publik</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rootMenus.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  title="Belum ada item navigasi"
                  description="Tambahkan item menu agar pengunjung website dapat menjelajahi halaman institusi."
                />
              </div>
            ) : (
              rootMenus.map((root, rootIndex) => {
                const submenus = getSubmenus(root.id);
                return (
                  <div key={root.id} className="bg-white dark:bg-slate-900">
                    {/* Root Menu Row */}
                    <div className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Order buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveOrder(root, 'up')}
                            disabled={rootIndex === 0}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(root, 'down')}
                            disabled={rootIndex === rootMenus.length - 1}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {root.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {root.url}
                            </span>
                            {root.target === '_blank' && (
                              <Badge variant="blue" className="text-[9px]">
                                Tab Baru
                              </Badge>
                            )}
                            {!root.isActive && (
                              <Badge variant="gray" className="text-[9px]">
                                Nonaktif
                              </Badge>
                            )}
                          </div>
                          {submenus.length > 0 && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              {submenus.length} submenu turunan
                            </span>
                          )}
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(root)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setMenuToDelete(root);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submenus List */}
                    {submenus.length > 0 && (
                      <div className="pl-8 sm:pl-12 pr-4 pb-2 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                        {submenus.map((sub, subIndex) => (
                          <div
                            key={sub.id}
                            className="p-2 rounded-xl flex items-center justify-between hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {sub.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {sub.url}
                                </span>
                                {sub.target === '_blank' && (
                                  <Badge variant="blue" className="text-[9px]">
                                    Tab Baru
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Order buttons */}
                              <button
                                onClick={() => handleMoveOrder(sub, 'up')}
                                disabled={subIndex === 0}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3 h-3 text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleMoveOrder(sub, 'down')}
                                disabled={subIndex === submenus.length - 1}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3 h-3 text-slate-400" />
                              </button>

                              {canManage && (
                                <>
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-blue-600"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMenuToDelete(sub);
                                      setDeleteModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg text-slate-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Menu Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingMenu ? 'Edit Item Menu' : 'Tambah Item Menu Baru'}
        >
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Label Teks Menu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Tentang Kami / Warta Sekolah..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                URL Tujuan Tautan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: /tentang, /berita, /agenda, atau https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Tautan Cepat:</span>
                {['/', '/tentang', '/berita', '/artikel', '/pengumuman', '/agenda', '/galeri', '/kontak'].map(
                  (path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => setUrl(path)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300"
                    >
                      {path}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Menu Induk (Parent Menu)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="">— Menu Utama Tingkat 1 (Bukan Submenu) —</option>
                {rootMenus
                  .filter((m) => !editingMenu || m.id !== editingMenu.id)
                  .map((root) => (
                    <option key={root.id} value={root.id}>
                      {root.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Buka
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="_self">Tab Saat Ini (_self)</option>
                  <option value="_blank">Buka di Tab Baru (_blank)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status Aktif
                </label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="active">Aktif Tampil</option>
                  <option value="inactive">Sembunyikan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Simpan Menu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && menuToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Menu Navigasi"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus menu{' '}
              <strong className="text-slate-900 dark:text-white">
                "{menuToDelete.label}"
              </strong>
              ? Jika menu ini memiliki sub-menu, sub-menu akan diangkat ke level utama.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Hapus Menu
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
