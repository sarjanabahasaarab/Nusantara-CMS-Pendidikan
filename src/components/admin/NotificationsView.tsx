import React, { useState } from 'react';
import { 
  Bell, Check, Trash2, Clock, CheckCircle2, 
  AlertCircle, Info, Filter, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { Notification } from '../../types';

interface NotificationsViewProps {
  onNavigate?: (nav: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const [filterType, setFilterType] = useState<string>('ALL');
  const notifications = cmsDb.getNotifications(tenantId, user?.id);

  const handleMarkAsRead = (id: string) => {
    cmsDb.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) cmsDb.markNotificationAsRead(n.id);
    });
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'READ') return n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-indigo-600" />
            Pusat Notifikasi & Pemberitahuan Akademik
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Notifikasi persetujuan surat izin, pengumuman ujian, publikasi nilai, dan aktivitas institusi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
          >
            <Check className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('UNREAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'UNREAD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Belum Dibaca ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilterType('READ')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'READ' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Sudah Dibaca
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            Tidak ada notifikasi yang ditemukan.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                notif.isRead ? 'bg-white border-slate-200 text-slate-700' : 'bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${
                  notif.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                  notif.type === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                  notif.type === 'ERROR' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    {notif.title}
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(notif.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded text-xs"
                    title="Tandai telah dibaca"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
