/**
 * Nusantara Education CMS - Manajemen Kurikulum, CP & TP
 * Phase 4 - Kurikulum Merdeka, K13, and Outcome-Based Education (OBE)
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Sparkles,
  FileText,
  Target,
  Edit,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { Curriculum, CurriculumSubject, Subject } from '../../types';

interface CurriculumManagementProps {
  onNavigate?: (view: any) => void;
}

export const CurriculumManagement: React.FC<CurriculumManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();

  const [curriculums, setCurriculums] = useState<Curriculum[]>(cmsStore.getCurriculums(tenantId));
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(
    curriculums[0]?.id || ''
  );
  const [subjects] = useState<Subject[]>(cmsStore.getSubjects(tenantId));
  const [curriculumSubjects, setCurriculumSubjects] = useState<CurriculumSubject[]>(
    selectedCurriculumId ? cmsStore.getCurriculumSubjects(selectedCurriculumId) : []
  );

  const [showCpTpModal, setShowCpTpModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [cpText, setCpText] = useState('');
  const [tpText, setTpText] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [gradeLevelCode, setGradeLevelCode] = useState('X');

  const refreshData = () => {
    const currs = cmsStore.getCurriculums(tenantId);
    setCurriculums(currs);
    if (selectedCurriculumId) {
      setCurriculumSubjects(cmsStore.getCurriculumSubjects(selectedCurriculumId));
    }
  };

  const handleSelectCurriculum = (id: string) => {
    setSelectedCurriculumId(id);
    setCurriculumSubjects(cmsStore.getCurriculumSubjects(id));
  };

  const handleOpenCpTp = (subjectId?: string) => {
    const targetSubjectId = subjectId || subjects[0]?.id || '';
    setSelectedSubjectId(targetSubjectId);
    const existing = curriculumSubjects.find((cs) => cs.subjectId === targetSubjectId);
    if (existing) {
      setCpText(existing.learningOutcomes || '');
      setTpText(existing.learningObjectives || '');
      setHoursPerWeek(existing.hoursPerWeek || 4);
      setGradeLevelCode(existing.gradeLevelCode || 'X');
    } else {
      setCpText('');
      setTpText('');
      setHoursPerWeek(4);
      setGradeLevelCode('X');
    }
    setShowCpTpModal(true);
  };

  const handleSaveCpTp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurriculumId || !selectedSubjectId) return;

    cmsStore.saveCurriculumSubject({
      curriculumId: selectedCurriculumId,
      subjectId: selectedSubjectId,
      gradeLevelCode,
      learningOutcomes: cpText,
      learningObjectives: tpText,
      hoursPerWeek: Number(hoursPerWeek),
      isCompulsory: true,
    });

    refreshData();
    setShowCpTpModal(false);
  };

  const activeCurriculum = curriculums.find((c) => c.id === selectedCurriculumId) || curriculums[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Manajemen Kurikulum & Capaian Belajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengorganisasian struktur Kurikulum Merdeka, Capaian Pembelajaran (CP), dan Tujuan Pembelajaran (TP).
          </p>
        </div>
      </div>

      {/* Grid: Pilihan Kurikulum */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curriculums.map((curr) => {
          const isSelected = selectedCurriculumId === curr.id;
          return (
            <div
              key={curr.id}
              onClick={() => handleSelectCurriculum(curr.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {curr.curriculumType} • {curr.versionYear}
                  </span>
                  {curr.isActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Diterapkan
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{curr.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {curr.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Kode: {curr.code}</span>
                <span className="font-semibold text-blue-600 flex items-center">
                  Buka CP/TP <ChevronRight className="w-4 h-4 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daftar Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) */}
      {activeCurriculum && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Struktur Mata Pelajaran & Capaian Kompetensi
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeCurriculum.name}
              </h2>
            </div>
            <button
              onClick={() => handleOpenCpTp()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Kelola CP & TP Mata Pelajaran
            </button>
          </div>

          <div className="space-y-4">
            {curriculumSubjects.map((cs) => {
              const subj = subjects.find((s) => s.id === cs.subjectId);
              return (
                <div
                  key={cs.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded">
                        Fase {cs.gradeLevelCode || 'E'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {subj?.name || 'Mata Pelajaran'} ({subj?.code})
                      </h3>
                      <span className="text-xs text-slate-400">• {cs.hoursPerWeek} Jam Tatap Muka/Minggu</span>
                    </div>
                    <button
                      onClick={() => handleOpenCpTp(cs.subjectId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
                    >
                      <Edit className="w-3.5 h-3.5" /> Ubah CP/TP
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Capaian Pembelajaran */}
                    <div className="rounded-lg bg-white p-3.5 border border-slate-200/70">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Capaian Pembelajaran (CP):
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {cs.learningOutcomes || 'Belum dirumuskan.'}
                      </p>
                    </div>

                    {/* Tujuan Pembelajaran */}
                    <div className="rounded-lg bg-white p-3.5 border border-slate-200/70">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1.5">
                        <Target className="w-4 h-4 text-blue-600" />
                        Tujuan Pembelajaran (TP):
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {cs.learningObjectives || 'Belum dirumuskan.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {curriculumSubjects.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                Belum ada rumusan Capaian Pembelajaran (CP) dan TP yang ditautkan ke kurikulum ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal CP & TP Form */}
      {showCpTpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Rumuskan Capaian (CP) & Tujuan Pembelajaran (TP)
            </h3>
            <form onSubmit={handleSaveCpTp} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Mata Pelajaran</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tingkat / Fase</label>
                  <input
                    type="text"
                    value={gradeLevelCode}
                    onChange={(e) => setGradeLevelCode(e.target.value)}
                    placeholder="X / Fase E / Sem 1"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Alokasi Jam Mengajar per Minggu</label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Capaian Pembelajaran (CP)
                </label>
                <textarea
                  required
                  rows={4}
                  value={cpText}
                  onChange={(e) => setCpText(e.target.value)}
                  placeholder="Rumuskan kompetensi dan lingkup materi esensial..."
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Tujuan Pembelajaran (TP) & Alur Tujuan Pembelajaran (ATP)
                </label>
                <textarea
                  required
                  rows={4}
                  value={tpText}
                  onChange={(e) => setTpText(e.target.value)}
                  placeholder="1. Menyelesaikan masalah...\n2. Merancang..."
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCpTpModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Capaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
