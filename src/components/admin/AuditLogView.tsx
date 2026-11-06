import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Terminal,
  FileText,
  Layers,
  Settings,
  Download,
} from 'lucide-react';
import { AuditLog } from '../../types';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      (log.userName && log.userName.toLowerCase().includes(search.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      selectedAction === 'ALL' || log.action.includes(selectedAction);

    return matchesSearch && matchesAction;
  });

  const handleExportCsv = () => {
    const headers = ['Waktu', 'Pengguna', 'Peran', 'Aksi', 'Entitas', 'Rincian', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.createdAt,
      l.userName || 'Sistem',
      l.userRole || '-',
      l.action,
      l.entity,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_nusantara_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('LOGIN') || action.includes('SUCCESS')) return 'success';
    if (action.includes('FAILED') || action.includes('DELETE')) return 'danger';
    if (action.includes('UPDATE') || action.includes('PUBLISH')) return 'purple';
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Rekaman Jejak Audit Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log forensik aktivitas pengguna, autentikasi, publikasi artikel, dan perubahan konfigurasi sistem.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="gap-2 shrink-0 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Log (CSV)</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aksi, pengguna, atau rincian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">Semua Tipe Aksi</option>
              <option value="LOGIN">Autentikasi (LOGIN / LOGOUT)</option>
              <option value="POST">Artikel (POST_*)</option>
              <option value="PAGE">Halaman (PAGE_*)</option>
              <option value="MEDIA">Pustaka Media</option>
              <option value="USER">Manajemen Pengguna</option>
              <option value="ROLE">Otorisasi & Role</option>
              <option value="SETTING">Pengaturan Sistem</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Waktu (Timestamp)</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">Rincian Perubahan</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(log.createdAt, 'full')}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-900 dark:text-white">
                      <div>
                        <span className="font-bold">{log.userName || 'Sistem'}</span>
                        {log.userRole && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {log.userRole}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {log.entity}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-200 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{log.details || '-'}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
