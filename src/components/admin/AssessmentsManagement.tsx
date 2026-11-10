import React, { useState } from 'react';
import { 
  Award, Lock, Unlock, History, Download, Upload, 
  Save, AlertTriangle, CheckCircle, Search, Filter, Plus, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  AssessmentComponent, StudentAssessment, GradeRevision, 
  AssessmentType 
} from '../../types';

interface AssessmentsManagementProps {
  onNavigate?: (nav: string) => void;
}

export const AssessmentsManagement: React.FC<AssessmentsManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const classes = cmsDb.getClasses(tenantId);
  const subjects = cmsDb.getSubjects(tenantId);
  const academicYears = cmsDb.getAcademicYears(tenantId);
  const activeYear = academicYears.find(y => y.isActive) || academicYears[0];

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'grades' | 'components' | 'revisions'>('grades');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Components for this class + subject + year
  const components = cmsDb.getAssessmentComponents(tenantId, {
    classId: selectedClassId,
    subjectId: selectedSubjectId,
    academicYearId: activeYear?.id
  });

  // Default active component
  React.useEffect(() => {
    if (components.length > 0 && (!selectedComponentId || !components.some(c => c.id === selectedComponentId))) {
      setSelectedComponentId(components[0].id);
    }
  }, [components, selectedComponentId]);

  const activeComponent = components.find(c => c.id === selectedComponentId);

  // Students in class
  const classStudents = cmsDb.getStudents(tenantId).filter(s => s.classId === selectedClassId);

  // Assessments for active component
  const existingAssessments = activeComponent
    ? cmsDb.getStudentAssessments(tenantId, { componentId: activeComponent.id })
    : [];

  // Local state for score edits: studentId -> { score, feedback, letterGrade }
  const [scoresMap, setScoresMap] = useState<Record<string, { score: number; feedback: string }>>({});

  React.useEffect(() => {
    const map: Record<string, { score: number; feedback: string }> = {};
    classStudents.forEach(st => {
      const found = existingAssessments.find(a => a.studentId === st.id);
      map[st.id] = {
        score: found ? found.score : (activeComponent?.passingGrade || 75),
        feedback: found ? (found.feedback || '') : ''
      };
    });
    setScoresMap(map);
  }, [selectedComponentId, selectedClassId, existingAssessments.length]);

  // Form for creating new component
  const [showNewCompModal, setShowNewCompModal] = useState<boolean>(false);
  const [compName, setCompName] = useState<string>('');
  const [compType, setCompType] = useState<AssessmentType>('FORMATIF_TUGAS');
  const [compWeight, setCompWeight] = useState<number>(20);
  const [compPassing, setCompPassing] = useState<number>(75);
  const [compCpDesc, setCompCpDesc] = useState<string>('Memahami capaian pembelajaran materi inti');

  // Reason for score revision modal
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [pendingSaveData, setPendingSaveData] = useState<any[] | null>(null);
  const [revisionReason, setRevisionReason] = useState<string>('');

  // Revisions log
  const allRevisions = cmsDb.getGradeRevisions({ tenantId });

  const handleScoreChange = (studentId: string, val: number) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: Math.max(0, Math.min(100, val))
      }
    }));
  };

  const handleFeedbackChange = (studentId: string, val: string) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feedback: val
      }
    }));
  };

  const handleInitiateSave = () => {
    if (!user || !activeComponent) return;

    // Check if any existing assessment is locked
    const isAnyLocked = existingAssessments.some(a => a.isLocked);
    if (isAnyLocked) {
      setMessage({ type: 'error', text: 'Komponen nilai ini terkunci (Locked). Buka kunci terlebih dahulu untuk mengedit nilai.' });
      return;
    }

    // Prepare data
    const recordsToSave = classStudents.map(st => {
      const current = scoresMap[st.id] || { score: 75, feedback: '' };
      const existing = existingAssessments.find(a => a.studentId === st.id);
      return {
        tenantId,
        componentId: activeComponent.id,
        studentId: st.id,
        score: current.score,
        passingGrade: activeComponent.passingGrade,
        feedback: current.feedback,
        existingId: existing?.id,
        oldScore: existing?.score
      };
    });

    // Check if modifying already saved scores (requires revision reason)
    const modifiedExisting = recordsToSave.some(r => r.existingId && r.oldScore !== r.score);
    if (modifiedExisting) {
      setPendingSaveData(recordsToSave);
      setShowRevisionModal(true);
    } else {
      executeSave(recordsToSave, 'Input nilai awal');
    }
  };

  const executeSave = (records: any[], reasonText: string) => {
    if (!user) return;
    try {
      records.forEach(r => {
        cmsDb.upsertStudentAssessment(
          {
            tenantId: r.tenantId,
            componentId: r.componentId,
            studentId: r.studentId,
            score: r.score,
            feedback: r.feedback
          },
          user,
          reasonText
        );
      });

      setShowRevisionModal(false);
      setPendingSaveData(null);
      setRevisionReason('');
      setMessage({ type: 'success', text: 'Nilai peserta didik berhasil disimpan dan dihitung otomatis!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan nilai' });
    }
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const created = cmsDb.createAssessmentComponent(
        {
          tenantId,
          academicYearId: activeYear?.id || '',
          semesterId: 'smt-2024-genap',
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          name: compName,
          code: compName.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
          type: compType,
          weight: compWeight,
          passingGrade: compPassing,
          competencyDesc: compCpDesc,
          isLocked: false
        },
        user
      );
      setShowNewCompModal(false);
      setCompName('');
      setSelectedComponentId(created.id);
      setMessage({ type: 'success', text: `Komponen penilaian ${created.name} berhasil dibuat.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membuat komponen' });
    }
  };

  const handleToggleLockComponent = () => {
    if (!user || !activeComponent) return;
    try {
      const newLockState = !activeComponent.isLocked;
      cmsDb.toggleLockAssessment(activeComponent.id, newLockState, user);
      setMessage({ 
        type: 'success', 
        text: newLockState ? 'Komponen nilai telah DIKUNCI (Nilai tidak dapat diubah lagi).' : 'Kunci komponen nilai telah DIBUKA.' 
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah status kunci' });
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  // Total weight check for this class & subject
  const totalWeight = components.reduce((acc, c) => acc + c.weight, 0);

  const filteredStudents = classStudents.filter(st =>
    st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.nisn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            Penilaian & Asesmen Akademik
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan bobot asesmen (formatif, sumatif, ASTS, ASAS), input nilai per CP/TP, penguncian nilai, dan jejak revisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('grades')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              viewTab === 'grades' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Matriks Nilai
          </button>
          <button
            onClick={() => setViewTab('components')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              viewTab === 'components' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bobot Komponen
          </button>
          <button
            onClick={() => setViewTab('revisions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              viewTab === 'revisions' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Audit Revisi
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* FILTER SELECTION BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Komponen Asesmen</label>
          <div className="flex items-center gap-2">
            <select
              value={selectedComponentId}
              onChange={e => setSelectedComponentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {components.length === 0 ? (
                <option value="">(Belum ada komponen - Tambah baru)</option>
              ) : (
                components.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Bobot: {c.weight}% | KKM: {c.passingGrade}) {c.isLocked ? '🔒' : ''}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => setShowNewCompModal(true)}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition flex-shrink-0"
              title="Tambah Komponen Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewTab === 'grades' && (
        <>
          {/* Active Component Details Bar */}
          {activeComponent ? (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{activeComponent.name}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800">
                    {activeComponent.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    Bobot: {activeComponent.weight}%
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    KKM / Kriteria: {activeComponent.passingGrade}
                  </span>
                  {activeComponent.isLocked && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Terkunci
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  <b>Capaian Pembelajaran (CP/TP):</b> {activeComponent.competencyDesc || 'Belum ada deskripsi'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLockComponent}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeComponent.isLocked 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {activeComponent.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {activeComponent.isLocked ? 'Buka Kunci Nilai' : 'Kunci Nilai (Lock)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Belum ada komponen penilaian untuk mata pelajaran ini di kelas terpilih.</span>
              <button
                onClick={() => setShowNewCompModal(true)}
                className="px-3 py-1 bg-amber-600 text-white rounded font-bold"
              >
                + Buat Komponen Penilaian
              </button>
            </div>
          )}

          {/* SPREADSHEET TABLE */}
          {activeComponent && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                <div className="text-xs text-slate-600">
                  Daftar Nilai: <b>{selectedClass?.name}</b> • Mapel: <b>{selectedSubject?.name}</b>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8,NISN,Nama,Nilai\n" + 
                        classStudents.map(s => `${s.nisn || ''},"${s.fullName}",${scoresMap[s.id]?.score || 75}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `nilai_${selectedClass?.name}_${selectedSubject?.code}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Template CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3 w-28">NISN</th>
                      <th className="py-2.5 px-3 w-28 text-center">Nilai (0 - 100)</th>
                      <th className="py-2.5 px-3 w-20 text-center">Huruf</th>
                      <th className="py-2.5 px-3 w-28 text-center">Ketercapaian</th>
                      <th className="py-2.5 px-3">Catatan / Feedback CP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((st, idx) => {
                      const current = scoresMap[st.id] || { score: 75, feedback: '' };
                      const isPassing = current.score >= (activeComponent.passingGrade || 75);
                      const letter = current.score >= 90 ? 'A' :
                                     current.score >= 80 ? 'B' :
                                     current.score >= 70 ? 'C' :
                                     current.score >= 60 ? 'D' : 'E';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{st.fullName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{st.nisn || '-'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              disabled={activeComponent.isLocked}
                              value={current.score}
                              onChange={e => handleScoreChange(st.id, parseFloat(e.target.value) || 0)}
                              className={`w-20 px-2 py-1 text-center font-bold font-mono rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                                activeComponent.isLocked ? 'bg-slate-100 text-slate-500 cursor-not-allowed' :
                                isPassing ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'
                              }`}
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{letter}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isPassing ? 'Tuntas' : 'Remedial'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              disabled={activeComponent.isLocked}
                              placeholder="Deskripsi pencapaian kompetensi..."
                              value={current.feedback}
                              onChange={e => handleFeedbackChange(st.id, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Save */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {activeComponent.isLocked ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Nilai ini sedang terkunci. Buka kunci untuk menyimpan perubahan.
                    </span>
                  ) : (
                    <span>Perubahan nilai akan otomatis diaudit dan dicatat dalam riwayat revisi.</span>
                  )}
                </div>

                <button
                  disabled={activeComponent.isLocked}
                  onClick={handleInitiateSave}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                    activeComponent.isLocked
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Simpan Nilai Peserta Didik
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* COMPONENTS MANAGEMENT TAB */}
      {viewTab === 'components' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Daftar Komponen Asesmen ({selectedSubject?.name} - {selectedClass?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Total Bobot Saat Ini: <b className={totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalWeight}%</b> (Ideal: 100%)
              </p>
            </div>

            <button
              onClick={() => setShowNewCompModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Tambah Komponen
            </button>
          </div>

          <div className="divide-y divide-slate-200">
            {components.map(comp => (
              <div key={comp.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    {comp.name}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{comp.type}</span>
                    {comp.isLocked && <span className="text-rose-600 text-xs flex items-center gap-0.5"><Lock className="w-3 h-3" /> Locked</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Bobot: <b>{comp.weight}%</b> | KKM: <b>{comp.passingGrade}</b> | CP/TP: {comp.competencyDesc}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedComponentId(comp.id);
                      setViewTab('grades');
                    }}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"
                  >
                    Input Nilai
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVISIONS AUDIT LOG TAB */}
      {viewTab === 'revisions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Audit Log Revisi Nilai
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Setiap perubahan nilai yang sudah tersimpan terekam secara otomatis demi akuntabilitas akademik.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Komponen</th>
                  <th className="py-2.5 px-3 text-center">Nilai Lama</th>
                  <th className="py-2.5 px-3 text-center">Nilai Baru</th>
                  <th className="py-2.5 px-3">Alasan Revisi</th>
                  <th className="py-2.5 px-3">Diubah Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allRevisions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Belum ada rekaman revisi nilai pada sistem.
                    </td>
                  </tr>
                ) : (
                  allRevisions.map(rev => (
                    <tr key={rev.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(rev.createdAt).toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{rev.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rev.componentName}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-600 font-semibold">{rev.oldScore}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-600 font-bold">{rev.newScore}</td>
                      <td className="py-2.5 px-3 text-slate-700 italic">{rev.reason}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{rev.changedByName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVISION REASON CONFIRMATION MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Konfirmasi Revisi Nilai
            </h3>
            <p className="text-xs text-slate-600">
              Sistem mendeteksi bahwa terdapat nilai siswa yang diubah dari rekaman sebelumnya. Sesuai aturan akademik, harap cantumkan alasan revisi nilai.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Perubahan Nilai (Wajib)
              </label>
              <textarea
                rows={3}
                required
                value={revisionReason}
                onChange={e => setRevisionReason(e.target.value)}
                placeholder="Contoh: Koreksi hasil remedial ulangan harian bab 3..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowRevisionModal(false);
                  setPendingSaveData(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!revisionReason.trim()}
                onClick={() => executeSave(pendingSaveData || [], revisionReason)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white ${
                  revisionReason.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Konfirmasi & Simpan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW COMPONENT MODAL */}
      {showNewCompModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Buat Komponen Asesmen Baru</h3>
            <form onSubmit={handleCreateComponent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Asesmen</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  placeholder="Contoh: Tugas 1: Algoritma / Sumatif Tengah Semester"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Asesmen</label>
                <select
                  value={compType}
                  onChange={e => setCompType(e.target.value as AssessmentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="FORMATIF_TUGAS">Formatif: Tugas / PR</option>
                  <option value="FORMATIF_KUIS">Formatif: Kuis Singkat</option>
                  <option value="FORMATIF_PRAKTIK">Formatif: Praktik / Proyek</option>
                  <option value="SUMATIF_LINGKUP_MATERI">Sumatif: Lingkup Materi (Bab)</option>
                  <option value="SUMATIF_TENGAH_SEMESTER">Sumatif: Tengah Semester (ASTS)</option>
                  <option value="SUMATIF_AKHIR_SEMESTER">Sumatif: Akhir Semester (ASAS)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Persentase (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={compWeight}
                    onChange={e => setCompWeight(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM / Kriteria Ketercapaian</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={compPassing}
                    onChange={e => setCompPassing(parseFloat(e.target.value) || 75)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Capaian Pembelajaran (CP/TP)</label>
                <textarea
                  rows={2}
                  value={compCpDesc}
                  onChange={e => setCompCpDesc(e.target.value)}
                  placeholder="Deskripsi kompetensi yang dinilai..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewCompModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Simpan Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
