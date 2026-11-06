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
  Sliders,
  Filter,
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

interface PermissionMatrixProps {
  roles: Role[];
  initialSelectedRole?: RoleName;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ roles, initialSelectedRole }) => {
  const { user } = useAuth();
  const [selectedRoleName, setSelectedRoleName] = useState<RoleName>(
    initialSelectedRole || 'GURU'
  );
  const [activePermissions, setActivePermissions] = useState<PermissionCode[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [filterModule, setFilterModule] = useState<string>('ALL');

  // Sync role permissions when role changes
  React.useEffect(() => {
    const role = roles.find((r) => r.name === selectedRoleName || r.code === selectedRoleName);
    if (role) {
      setActivePermissions([...role.permissions]);
      setHasChanges(false);
    }
  }, [selectedRoleName, roles]);

  const togglePermission = (permCode: PermissionCode) => {
    if (selectedRoleName === 'SUPER_ADMIN') {
      alert('Hak akses SUPER_ADMIN bersifat absolut dan menguasai seluruh perizinan sistem.');
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

  const handleSelectAllInModule = (modulePermissions: typeof SYSTEM_PERMISSIONS) => {
    if (selectedRoleName === 'SUPER_ADMIN') return;
    const codes = modulePermissions.map((p) => p.code);
    const allSelected = codes.every((c) => activePermissions.includes(c));

    let updated: PermissionCode[];
    if (allSelected) {
      updated = activePermissions.filter((c) => !codes.includes(c));
    } else {
      const set = new Set([...activePermissions, ...codes]);
      updated = Array.from(set);
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

  const handleResetToDefault = () => {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[selectedRoleName];
    if (defaultPerms) {
      setActivePermissions([...defaultPerms]);
      setHasChanges(true);
    }
  };

  // Kelompokkan permissions berdasarkan module
  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof SYSTEM_PERMISSIONS>);

  const currentRole = roles.find((r) => r.name === selectedRoleName || r.code === selectedRoleName);
  const isSuperAdmin = selectedRoleName === 'SUPER_ADMIN';

  const modules = Object.keys(groupedPermissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Matriks Hak Akses & Permission Granular
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Konfigurasi hak otorisasi granular per modul untuk setiap role pendidikan (Section E).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleResetToDefault} className="text-xs">
              Kembalikan Default
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveMatrix}
            disabled={!hasChanges && !savedSuccess}
            className={`gap-1.5 ${savedSuccess ? 'bg-emerald-600 text-white' : ''}`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Berhasil Disimpan
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Pilih Role yang Dikelola:
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleName(r.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedRoleName === r.name
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{r.name.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Card Role Terpilih */}
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Role: {currentRole?.name.replace(/_/g, ' ')}
              </h2>
              <Badge variant={isSuperAdmin ? 'purple' : 'outline'} className="text-[10px]">
                {currentRole?.code}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {currentRole?.description || 'Definisi peran sistem institusi.'}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              {isSuperAdmin ? 'Akses Penuh (100%)' : `${activePermissions.length} / ${SYSTEM_PERMISSIONS.length} Izin Aktif`}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isSuperAdmin ? 'SUPER_ADMIN dilindungi sistem' : hasChanges ? 'Belum disimpan' : 'Tersinkron'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Modul & Quick Actions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-slate-500 whitespace-nowrap">Filter Modul:</span>
        <button
          onClick={() => setFilterModule('ALL')}
          className={`px-2.5 py-1 rounded ${
            filterModule === 'ALL'
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Semua ({modules.length})
        </button>
        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => setFilterModule(mod)}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              filterModule === mod
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Daftar Modul & Checkbox Permissions (Section E) */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions)
          .filter(([moduleName]) => filterModule === 'ALL' || filterModule === moduleName)
          .map(([moduleName, perms]) => {
            const allSelectedInMod = perms.every((p) => activePermissions.includes(p.code) || isSuperAdmin);

            return (
              <Card key={moduleName} className="border-slate-200 dark:border-slate-800">
                <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Modul: {moduleName}
                    </CardTitle>

                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleSelectAllInModule(perms)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        {allSelectedInMod ? 'Batal Pilih Semua' : 'Pilih Semua Modul Ini'}
                      </button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((perm) => {
                    const isGranted = isSuperAdmin || activePermissions.includes(perm.code);

                    return (
                      <div
                        key={perm.code}
                        onClick={() => togglePermission(perm.code)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isGranted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        } ${isSuperAdmin ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          disabled={isSuperAdmin}
                          onChange={() => {}} // Handled by parent div
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {perm.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {perm.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};
