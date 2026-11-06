import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  Terminal,
  Calendar,
} from 'lucide-react';
import { AuditLog } from '../../types';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface ActivityLogsViewProps {
  logs: AuditLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const entities = Array.from(new Set(logs.map((l) => l.entity).filter(Boolean)));

  const filteredLogs = logs.filter((log) => {
    const matchEntity = entityFilter === 'ALL' || log.entity === entityFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.userName && log.userName.toLowerCase().includes(q)) ||
      (log.userRole && log.userRole.toLowerCase().includes(q));

    return matchEntity && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Jejak Audit & Log Keamanan Sistem (Section Q)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Rekaman jejak transaksi mutasi data, login, alokasi role, permission, serta integritas platform institusi.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aksi, pengguna, atau rincian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Entitas Modul</option>
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Log Aktivitas */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Waktu Kejadian</th>
                <th className="p-3">Pengguna & Peran</th>
                <th className="p-3">Aksi / Operasi</th>
                <th className="p-3">Entitas</th>
                <th className="p-3">Rincian Perubahan</th>
                <th className="p-3">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-sans">
                    <EmptyState
                      title="Tidak Ada Jejak Audit"
                      description="Belum ada aktivitas yang terekam pada kriteria pencarian ini."
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
                  const isAuthFail = item.action.includes('FAILED') || item.action.includes('BLOCK');

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isAuthFail ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="p-3 whitespace-nowrap font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.userName || 'Sistem Otomatis'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.userRole || 'SYSTEM'}
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <Badge
                          variant={
                            item.action.includes('DELETE') || item.action.includes('BLOCK') || item.action.includes('FAIL')
                              ? 'danger'
                              : item.action.includes('CREATE') || item.action.includes('LINK')
                              ? 'success'
                              : item.action.includes('UPDATE')
                              ? 'blue'
                              : 'default'
                          }
                          className="text-[10px] py-0 px-1.5"
                        >
                          {item.action}
                        </Badge>
                      </td>

                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">
                        {item.entity}
                      </td>

                      <td className="p-3 font-sans text-xs text-slate-800 dark:text-slate-200 max-w-md">
                        {item.details}
                      </td>

                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {item.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
