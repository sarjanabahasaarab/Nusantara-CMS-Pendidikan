import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Trash2,
  Search,
  ExternalLink,
  ShieldAlert,
  User,
  Clock,
} from 'lucide-react';
import { Comment, ActiveNav, CommentStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface CommentsManagementProps {
  comments: Comment[];
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const CommentsManagement: React.FC<CommentsManagementProps> = ({
  comments,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CommentStatus | 'ALL'>('PENDING');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const canManage = hasPermission(user, 'comments.manage');

  const countPending = comments.filter((c) => c.status === 'PENDING').length;
  const countApproved = comments.filter((c) => c.status === 'APPROVED').length;
  const countSpam = comments.filter((c) => c.status === 'SPAM').length;
  const countTrashed = comments.filter((c) => c.status === 'TRASHED').length;

  const filteredComments = comments.filter((c) => {
    if (activeTab !== 'ALL' && c.status !== activeTab) return false;
    const matchesSearch =
      c.authorName.toLowerCase().includes(search.toLowerCase()) ||
      c.authorEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.contentTitle && c.contentTitle.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const handleStatusChange = (id: string, status: CommentStatus) => {
    cmsStore.updateCommentStatus(id, status, user);
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      cmsStore.deleteComment(commentToDelete.id, user);
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const getStatusBadge = (status: CommentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="amber">Menunggu Moderasi</Badge>;
      case 'APPROVED':
        return <Badge variant="green">Disetujui</Badge>;
      case 'SPAM':
        return <Badge variant="red">Spam Terdeteksi</Badge>;
      case 'TRASHED':
        return <Badge variant="gray">Sampah</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Moderasi Komentar Pengunjung</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjau respon pembaca pada warta dan artikel, saring pesan spam/iklan liar, dan kelola interaksi sehat.
          </p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'PENDING'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Menunggu ({countPending})
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Disetujui ({countApproved})
        </button>
        <button
          onClick={() => setActiveTab('SPAM')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'SPAM'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Spam ({countSpam})
        </button>
        <button
          onClick={() => setActiveTab('TRASHED')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'TRASHED'
              ? 'border-slate-600 text-slate-600 dark:text-slate-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sampah ({countTrashed})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Semua Komentar ({comments.length})
        </button>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pengirim, email, isi pesan, atau judul konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <EmptyState
                title="Tidak ada komentar pada filter ini"
                description="Semua komentar telah diproses atau belum ada interaksi baru dari pengunjung."
              />
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {comment.authorName}
                    </span>
                    <span className="text-slate-400">({comment.authorEmail})</span>
                    {getStatusBadge(comment.status)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {comment.contentTitle && (
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                      Pada Konten: "{comment.contentTitle}"
                    </div>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {comment.content}
                  </p>

                  {comment.ipAddress && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      IP: {comment.ipAddress}
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {comment.status !== 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(comment.id, 'APPROVED')}
                        className="text-xs text-emerald-600 hover:bg-emerald-50 gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </Button>
                    )}

                    {comment.status !== 'SPAM' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(comment.id, 'SPAM')}
                        className="text-xs text-amber-600 hover:bg-amber-50 gap-1"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>Spam</span>
                      </Button>
                    )}

                    {comment.status !== 'TRASHED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(comment.id, 'TRASHED')}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setCommentToDelete(comment);
                          setDeleteModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        Hapus Permanen
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && commentToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Permanen Komentar"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus permanen komentar dari{' '}
              <strong className="text-slate-900 dark:text-white">
                "{commentToDelete.authorName}"
              </strong>
              ?
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
                Hapus Permanen
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
