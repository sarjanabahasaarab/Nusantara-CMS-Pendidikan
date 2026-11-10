import React, { useState } from 'react';
import { 
  CheckSquare, Clock, Users, Play, AlertCircle, 
  Search, Filter, Plus, Eye, Edit3, Award, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  Examination, ExamSubmission, ExamType, ExamStatus 
} from '../../types';

interface ExaminationsManagementProps {
  onNavigate?: (nav: string) => void;
}

export const ExaminationsManagement: React.FC<ExaminationsManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const subjects = cmsDb.getSubjects(tenantId);
  const classes = cmsDb.getClasses(tenantId);
  const questionBanks = cmsDb.getQuestionBanks(tenantId);
  const academicYears = cmsDb.getAcademicYears(tenantId);
  const activeYear = academicYears.find(y => y.isActive) || academicYears[0];

  const [activeTab, setActiveTab] = useState<'exams' | 'submissions'>('exams');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Exam form
  const [title, setTitle] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [bankId, setBankId] = useState<string>(questionBanks[0]?.id || '');
  const [examType, setExamType] = useState<ExamType>('ONLINE_CBT');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [passingGrade, setPassingGrade] = useState<number>(75);
  const [startTime, setStartTime] = useState<string>('2025-06-10T08:00');
  const [endTime, setEndTime] = useState<string>('2025-06-10T10:00');
  const [targetClassIds, setTargetClassIds] = useState<string[]>([classes[0]?.id || '']);

  // Essay grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<ExamSubmission | null>(null);
  const [manualScoreAdjust, setManualScoreAdjust] = useState<number>(0);
  const [examinerNotes, setExaminerNotes] = useState<string>('');

  const examinations = cmsDb.getExaminations(tenantId);

  // Set default selected exam
  React.useEffect(() => {
    if (examinations.length > 0 && !selectedExamId) {
      setSelectedExamId(examinations[0].id);
    }
  }, [examinations, selectedExamId]);

  const selectedExam = examinations.find(e => e.id === selectedExamId);
  const submissions = selectedExam ? cmsDb.getExamSubmissions(tenantId, selectedExam.id) : [];

  const handleScheduleExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const created = cmsDb.createExamination(
        {
          tenantId,
          academicYearId: activeYear?.id || '',
          semesterId: 'smt-2024-genap',
          subjectId,
          bankId,
          title,
          code: title.toUpperCase().replace(/\s+/g, '_').substring(0, 15),
          type: examType,
          status: 'SCHEDULED',
          startTime,
          endTime,
          durationMinutes,
          passingGrade,
          isRandomized: true,
          showResultImmediately: true,
          targetClassIds
        },
        user
      );

      setShowScheduleModal(false);
      setTitle('');
      setSelectedExamId(created.id);
      setMessage({ type: 'success', text: `Jadwal Ujian "${created.title}" berhasil diterbitkan!` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menjadwalkan ujian' });
    }
  };

  const handleSaveManualGrading = () => {
    if (!user || !gradingSubmission) return;

    try {
      const currentFinal = gradingSubmission.totalScore ?? 0;
      const newFinal = Math.min(100, Math.max(0, currentFinal + manualScoreAdjust));
      const passed = newFinal >= (selectedExam?.passingGrade || 75);

      cmsDb.gradeExamSubmissionManual(
        tenantId,
        gradingSubmission.id,
        newFinal,
        passed,
        examinerNotes || 'Koreksi esai oleh guru penguji',
        user
      );

      setGradingSubmission(null);
      setManualScoreAdjust(0);
      setExaminerNotes('');
      setMessage({ type: 'success', text: 'Koreksi esai berhasil disimpan dan nilai akhir diperbarui!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan penilaian esai' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" />
            Jadwal Ujian & CBT Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan ujian online CBT & offline, timer otomatis, pemantau ujian langsung, dan antrean koreksi esai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'exams' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Daftar Ujian
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'submissions' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hasil & Antrean Esai ({submissions.length})
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition ml-2"
          >
            <Plus className="w-4 h-4" /> Jadwalkan Ujian
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {activeTab === 'exams' ? (
        /* EXAMS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {examinations.map(ex => {
            const subj = subjects.find(s => s.id === ex.subjectId);
            const subs = cmsDb.getExamSubmissions(tenantId, ex.id);

            return (
              <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                      {ex.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      ex.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-800' :
                      ex.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ex.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{ex.title}</h3>
                  <div className="text-xs text-slate-500">{subj?.name || 'Mata Pelajaran'}</div>

                  <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs text-slate-600">
                    <div><b>Waktu:</b> {new Date(ex.startTime).toLocaleString('id-ID')}</div>
                    <div><b>Durasi:</b> {ex.durationMinutes} Menit</div>
                    <div><b>KKM Lulus:</b> {ex.passingGrade}</div>
                    <div><b>Peserta Selesai:</b> {subs.length} Siswa</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <button
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveTab('submissions');
                    }}
                    className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs transition text-center"
                  >
                    Lihat Hasil ({subs.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SUBMISSIONS & ESSAY CORRECTION TAB */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Hasil Ujian: {selectedExam?.title || '-'}
              </h2>
              <p className="text-xs text-slate-500">
                Nilai otomatis dihitung untuk pilihan ganda & benar-salah. Soal esai memerlukan verifikasi guru.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Pilih Ujian:</label>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                {examinations.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 w-28 text-center">Mulai / Selesai</th>
                  <th className="py-2.5 px-3 w-24 text-center">Skor Akhir</th>
                  <th className="py-2.5 px-3 w-24 text-center">Kelulusan</th>
                  <th className="py-2.5 px-3">Catatan Korektor</th>
                  <th className="py-2.5 px-3 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Belum ada pengerjaan ujian untuk tes ini.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, idx) => {
                    const student = cmsDb.getStudents(tenantId).find(s => s.id === sub.studentId);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {student?.fullName || sub.studentId}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-indigo-700">
                          {sub.totalScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.isPassed ? 'LULUS' : 'REMEDIAL'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 italic">
                          {sub.feedback || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setManualScoreAdjust(0);
                              setExaminerNotes(sub.feedback || '');
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs transition"
                          >
                            Koreksi Esai
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESSAY GRADING MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Koreksi Esai & Penyesuaian Nilai</h3>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div><b>Skor Saat Ini:</b> {gradingSubmission.totalScore} / 100</div>
              <div><b>KKM Ujian:</b> {selectedExam?.passingGrade || 75}</div>
              <div><b>Waktu Submit:</b> {gradingSubmission.submittedAt ? new Date(gradingSubmission.submittedAt).toLocaleString('id-ID') : '-'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tambahan Nilai Esai (+/- Poin)
              </label>
              <input
                type="number"
                value={manualScoreAdjust}
                onChange={e => setManualScoreAdjust(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <span className="text-[11px] text-slate-500">
                Skor akhir menjadi: <b>{Math.min(100, Math.max(0, (gradingSubmission.totalScore ?? 0) + manualScoreAdjust))}</b>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Evaluasi / Umpan Balik Penguji
              </label>
              <textarea
                rows={3}
                value={examinerNotes}
                onChange={e => setExaminerNotes(e.target.value)}
                placeholder="Tuliskan evaluasi jawaban esai..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveManualGrading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE EXAM MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Jadwalkan Ujian / Tes Baru</h3>
            <form onSubmit={handleScheduleExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ujian</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Asesmen Sumatif Akhir Semester Genap"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Soal Terhubung</label>
                  <select
                    value={bankId}
                    onChange={e => setBankId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {questionBanks.map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Ujian</label>
                  <select
                    value={examType}
                    onChange={e => setExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ONLINE_CBT">Online CBT (Aplikasi)</option>
                    <option value="OFFLINE_PAPER">Tatap Muka Kertas (Paper)</option>
                    <option value="PRAKTIK">Ujian Praktik Mandiri</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mulai Ujian</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Selesai</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">KKM Kelulusan</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passingGrade}
                  onChange={e => setPassingGrade(parseFloat(e.target.value) || 75)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Terbitkan Jadwal Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
