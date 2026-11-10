/**
 * Nusantara Education CMS - Struktur Akademik (Rombel, Prodi, Tingkat, Fakultas)
 * Phase 4 - Flexible Educational Hierarchy for Schools & Higher Education
 */

import React, { useState } from 'react';
import {
  Compass,
  Layers,
  GraduationCap,
  Users,
  Plus,
  Edit,
  Trash2,
  Building2,
  BookOpen,
  CheckCircle2,
  DoorOpen,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { AcademicClass, GradeLevel, StudyProgram, Faculty, Department, TeacherProfile } from '../../types';

interface AcademicStructureManagementProps {
  onNavigate?: (view: any) => void;
}

export const AcademicStructureManagement: React.FC<AcademicStructureManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const isKampus = activeTenant?.category === 'KAMPUS';

  const [activeTab, setActiveTab] = useState<'ROMBEL' | 'PRODI' | 'GRADE' | 'FAKULTAS'>('ROMBEL');

  const [classes, setClasses] = useState<AcademicClass[]>(cmsStore.getAcademicClasses(tenantId));
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(cmsStore.getGradeLevels(tenantId));
  const [programs, setPrograms] = useState<StudyProgram[]>(cmsStore.getStudyPrograms(tenantId));
  const [faculties, setFaculties] = useState<Faculty[]>(cmsStore.getFaculties(tenantId));
  const [rooms] = useState(cmsStore.getRooms(tenantId));
  const [teachers] = useState<TeacherProfile[]>(cmsStore.getTeachers());
  const [academicYears] = useState(cmsStore.getAcademicYears(tenantId));
  const currentAy = cmsStore.getActiveAcademicYear(tenantId);

  // Modal State for Rombel
  const [showRombelModal, setShowRombelModal] = useState(false);
  const [rombelCode, setRombelCode] = useState('');
  const [rombelName, setRombelName] = useState('');
  const [rombelGradeId, setRombelGradeId] = useState('');
  const [rombelProdiId, setRombelProdiId] = useState('');
  const [rombelTeacherId, setRombelTeacherId] = useState('');
  const [rombelRoomId, setRombelRoomId] = useState('');
  const [rombelCapacity, setRombelCapacity] = useState(36);

  // Modal State for Prodi
  const [showProdiModal, setShowProdiModal] = useState(false);
  const [prodiCode, setProdiCode] = useState('');
  const [prodiName, setProdiName] = useState('');
  const [prodiDegree, setProdiDegree] = useState(isKampus ? 'S1' : 'SMA');
  const [prodiHead, setProdiHead] = useState('');
  const [prodiAccreditation, setProdiAccreditation] = useState('Unggul (A)');

  const refreshData = () => {
    setClasses(cmsStore.getAcademicClasses(tenantId));
    setGradeLevels(cmsStore.getGradeLevels(tenantId));
    setPrograms(cmsStore.getStudyPrograms(tenantId));
    setFaculties(cmsStore.getFaculties(tenantId));
  };

  const handleSaveRombel = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.createAcademicClass({
      tenantId,
      code: rombelCode,
      name: rombelName,
      gradeLevelId: rombelGradeId || gradeLevels[0]?.id || 'gl-1',
      studyProgramId: rombelProdiId || undefined,
      homeroomTeacherId: rombelTeacherId || undefined,
      roomId: rombelRoomId || undefined,
      maxCapacity: Number(rombelCapacity) || 36,
      currentStudents: 0,
      status: 'ACTIVE',
      academicYearId: currentAy?.id || 'ay-default',
    }, user);
    refreshData();
    setShowRombelModal(false);
  };

  const handleSaveProdi = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.createStudyProgram({
      tenantId,
      code: prodiCode,
      name: prodiName,
      degree: prodiDegree,
      headName: prodiHead,
      accreditation: prodiAccreditation,
    }, user);
    refreshData();
    setShowProdiModal(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Hapus rombongan belajar ini?')) {
      cmsStore.deleteAcademicClass(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-blue-600" />
            Struktur Pendidikan & Rombongan Belajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengaturan tingkatan kelas, rombongan belajar (rombel), program studi, dan fakultas.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'ROMBEL' && (
            <button
              onClick={() => {
                setRombelCode('');
                setRombelName('');
                setRombelGradeId(gradeLevels[0]?.id || '');
                setRombelProdiId(programs[0]?.id || '');
                setRombelCapacity(36);
                setShowRombelModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Rombel / Kelas
            </button>
          )}
          {activeTab === 'PRODI' && (
            <button
              onClick={() => {
                setProdiCode('');
                setProdiName('');
                setProdiDegree(isKampus ? 'S1' : 'SMA');
                setShowProdiModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Program Studi / Peminatan
            </button>
          )}
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('ROMBEL')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ROMBEL'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Rombongan Belajar ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('PRODI')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'PRODI'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {isKampus ? 'Program Studi' : 'Jurusan / Peminatan'} ({programs.length})
        </button>

        <button
          onClick={() => setActiveTab('GRADE')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'GRADE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Tingkat Kelas / Fase ({gradeLevels.length})
        </button>

        {isKampus && (
          <button
            onClick={() => setActiveTab('FAKULTAS')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'FAKULTAS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Fakultas & Departemen ({faculties.length})
          </button>
        )}
      </div>

      {/* Tab Content: Rombongan Belajar */}
      {activeTab === 'ROMBEL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const grade = gradeLevels.find((g) => g.id === cls.gradeLevelId);
            const prodi = programs.find((p) => p.id === cls.studyProgramId);
            const room = rooms.find((r) => r.id === cls.roomId);
            const homeroom = teachers.find((t) => t.id === cls.homeroomTeacherId);

            return (
              <div
                key={cls.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {grade?.name || 'Tingkat'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{cls.name}</h3>
                      <p className="text-xs text-slate-400">Kode: {cls.code}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {cls.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Peminatan / Prodi:</span>
                      <span className="font-semibold text-slate-800">{prodi?.name || 'Umum'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wali Kelas / Dosen PA:</span>
                      <span className="font-semibold text-slate-800">{homeroom?.fullName || 'Belum Ditetapkan'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ruangan Kelas:</span>
                      <span className="font-semibold text-slate-800">{room?.name || 'Fleksibel'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kapasitas Maksimal:</span>
                      <span>{cls.maxCapacity} Peserta</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Program Studi */}
      {activeTab === 'PRODI' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div key={prog.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Jenjang {prog.degree}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{prog.name}</h3>
                  <p className="text-xs text-slate-400">Kode: {prog.code}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {prog.accreditation || 'Akreditasi A'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span className="text-slate-400">Ketua Jurusan / Kaprodi: </span>
                <span className="font-semibold text-slate-800">{prog.headName || 'Pimpinan Jurusan'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Tingkat Kelas */}
      {activeTab === 'GRADE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gradeLevels.map((gl) => (
            <div key={gl.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Urutan ke-{gl.sequence}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{gl.name}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">Kode Simbol: {gl.code}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Fakultas (Higher Ed) */}
      {activeTab === 'FAKULTAS' && (
        <div className="space-y-4">
          {faculties.map((fac) => (
            <div key={fac.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                  <p className="text-xs text-slate-500">Dekan: {fac.deanName || 'Pimpinan Fakultas'}</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {fac.code}
                </span>
              </div>
              {fac.description && <p className="text-xs text-slate-600 leading-relaxed">{fac.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Rombel */}
      {showRombelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tambah Rombongan Belajar (Rombel)</h3>
            <form onSubmit={handleSaveRombel} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kode Kelas</label>
                  <input
                    type="text"
                    required
                    value={rombelCode}
                    onChange={(e) => setRombelCode(e.target.value)}
                    placeholder="X-MIPA-3"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    value={rombelCapacity}
                    onChange={(e) => setRombelCapacity(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap Kelas</label>
                <input
                  type="text"
                  required
                  value={rombelName}
                  onChange={(e) => setRombelName(e.target.value)}
                  placeholder="Kelas X MIPA 3"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tingkat Kelas</label>
                  <select
                    value={rombelGradeId}
                    onChange={(e) => setRombelGradeId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {gradeLevels.map((gl) => (
                      <option key={gl.id} value={gl.id}>
                        {gl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Program Studi / Peminatan</label>
                  <select
                    value={rombelProdiId}
                    onChange={(e) => setRombelProdiId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Ruangan Tetap</label>
                  <select
                    value={rombelRoomId}
                    onChange={(e) => setRombelRoomId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Tanpa Ruang Tetap --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Wali Kelas / Dosen PA</label>
                  <select
                    value={rombelTeacherId}
                    onChange={(e) => setRombelTeacherId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Pilih Guru / Dosen --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRombelModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Prodi */}
      {showProdiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Tambah {isKampus ? 'Program Studi' : 'Peminatan / Jurusan'}
            </h3>
            <form onSubmit={handleSaveProdi} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Kode</label>
                <input
                  type="text"
                  required
                  value={prodiCode}
                  onChange={(e) => setProdiCode(e.target.value)}
                  placeholder="MIPA / D4-RPL"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={prodiName}
                  onChange={(e) => setProdiName(e.target.value)}
                  placeholder="Rekayasa Perangkat Lunak"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jenjang Gelar</label>
                  <input
                    type="text"
                    value={prodiDegree}
                    onChange={(e) => setProdiDegree(e.target.value)}
                    placeholder="S1 / SMA / D4"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Akreditasi</label>
                  <input
                    type="text"
                    value={prodiAccreditation}
                    onChange={(e) => setProdiAccreditation(e.target.value)}
                    placeholder="Unggul (A)"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProdiModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
