import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  Info,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Role, RoleName, PermissionCode } from '../../types';
import {
  SYSTEM_PERMISSIONS,
  FUTURE_MODULE_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from '../../lib/permissions';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RolesPermissionsProps {
  roles: Role[];
}

export const RolesPermissions: React.FC<RolesPermissionsProps> = ({ roles }) => {
  const { user } = useAuth();
  const [selectedRoleName, setSelectedRoleName] = useState<RoleName>('ADMIN');
  const [activePermissions, setActivePermissions] = useState<PermissionCode[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync role permissions when role changes
  React.useEffect(() => {
    const role = roles.find((r) => r.name === selectedRoleName);
    if (role) {
      setActivePermissions([...role.permissions]);
      setHasChanges(false);
    }
  }, [selectedRoleName, roles]);

  const togglePermission = (permCode: PermissionCode) => {
    if (selectedRoleName === 'SUPER_ADMIN') {
      alert('Hak akses SUPER_ADMIN bersifat mutlak dan tidak dapat dibatasi.');
      return;
    }

    let updated: PermissionCode[];
    if (activePermissions.includes(permCode)) {
      updated = activePermissions.filter((p) => p !== permCode);
    } else {
      updated = [...activePermissions, permCode];
    }

    setActivePermissions(updated);
    setHasChanges(true);
  };

  const handleSaveMatrix = () => {
    cmsStore.updateRolePermissions(selectedRoleName, activePermissions, user);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Kelompokkan permissions berdasarkan module
  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof SYSTEM_PERMISSIONS>);

  const currentRole = roles.find((r) => r.name === selectedRoleName);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Matriks Peran & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi otorisasi berjenjang institusi pendidikan berdasarkan tugas pokok dan fungsi (Tupoksi).
          </p>
        </div>

        {hasChanges && (
          <Button
            variant="primary"
            onClick={handleSaveMatrix}
            className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Hak Akses</span>
          </Button>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Matriks hak akses untuk {selectedRoleName} berhasil disimpan ke basis data!</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoleName(r.name)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedRoleName === r.name
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{r.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded ${
                selectedRoleName === r.name
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {r.permissions.length} izin
            </span>
          </button>
        ))}
      </div>

      {/* Detail Role Info Card */}
      <Card>
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Peran: {currentRole?.name}
              </h3>
              {selectedRoleName === 'SUPER_ADMIN' && (
                <Badge variant="danger" size="sm">
                  Super Administrator
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentRole?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Permission Cards by Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
          <Card key={moduleName}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Modul: {moduleName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {perms.map((p) => {
                const isEnabled =
                  selectedRoleName === 'SUPER_ADMIN' || activePermissions.includes(p.code);

                return (
                  <div
                    key={p.code}
                    onClick={() => togglePermission(p.code)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isEnabled
                        ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 opacity-75'
                    }`}
                  >
                    <div className="space-y-0.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {p.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">({p.code})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{p.description}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isEnabled
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Arsitektur Modul Masa Depan (Phase 2-10 Preparation Notice) */}
      <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Fondasi Otorisasi Tahap Selanjutnya (Phase 2–10)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Arsitektur izin Nusantara Education CMS dirancang modular. Pada fase berikutnya, modul-modul berikut dapat langsung didaftarkan ke matriks RBAC tanpa perlu merombak skema basis data:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {FUTURE_MODULE_PERMISSIONS.map((future) => (
            <div
              key={future.module}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1"
            >
              <h5 className="font-semibold text-xs text-white">{future.module}</h5>
              <div className="flex flex-wrap gap-1">
                {future.codes.map((code) => (
                  <span
                    key={code}
                    className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-blue-300"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
