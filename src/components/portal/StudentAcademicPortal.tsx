import React, { useState } from 'react';
import { 
  GraduationCap, Calendar, Clock, Award, CheckSquare, 
  FileText, Play, CheckCircle, AlertCircle, ChevronRight, Save, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { Examination, Question } from '../../types';

interface StudentAcademicPortalProps {
  onNavigate?: (nav: string) => void;
}

export const StudentAcademicPortal: React.FC<StudentAcademicPortalProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  // Get student profile for current logged in user
  const allStudents = cmsDb.getStudents(tenantId);
  const currentStudent = allStudents.find(s => s.userId === user?.id) || allStudents[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'cbt' | 'grades' | 'leaves'>('overview');
  const [activeExam, setActiveExam] = useState<Examination | null>(null);
  const [cbtQuestions, setCbtQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [cbtAnswers, setCbtAnswers] = useState<Record<string, any>>({});
  const [cbtRemainingSeconds, setCbtRemainingSeconds] = useState<number>(3600);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Leave request form
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveType, setLeaveType] = useState<any>('SAKIT');
  const [leaveStartDate, setLeaveStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Student data
  const attendances = currentStudent ? cmsDb.getStudentAttendances(tenantId, { studentId: currentStudent.id }) : [];
  const reportCards = currentStudent ? cmsDb.getReportCards(tenantId, { studentId: currentStudent.id }) : [];
  const studentReports = reportCards.filter(r => r.status === 'APPROVED' || r.status === 'CHECKED');
  const examinations = cmsDb.getExaminations(tenantId);
  const submissions = currentStudent ? cmsDb.getExamSubmissions(tenantId).filter(s => s.studentId === currentStudent.id) : [];

  // CBT Timer
  React.useEffect(() => {
    if (!activeExam || examSubmitted) return;
    const interval = setInterval(() => {
      setCbtRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitCbt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExam, examSubmitted]);

  // Start CBT
  const handleStartCbt = (exam: Examination) => {
    const questions = cmsDb.getQuestions(tenantId, exam.bankId);
    if (questions.length === 0) {
      setMessage({ type: 'error', text: 'Bank soal untuk ujian ini belum memiliki butir soal.' });
      return;
    }
    setActiveExam(exam);
    setCbtQuestions(questions);
    setCurrentQIndex(0);
    setCbtAnswers({});
    setCbtRemainingSeconds(exam.durationMinutes * 60);
    setExamSubmitted(false);
    setExamScore(null);
  };

  const handleSelectAnswer = (qId: string, answer: any) => {
    setCbtAnswers(prev => ({
      ...prev,
      [qId]: answer
    }));
  };

  const handleSubmitCbt = () => {
    if (!activeExam || !currentStudent || !user) return;

    try {
      const answersArray = Object.entries(cbtAnswers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      }));

      const submission = cmsDb.submitExam(
        {
          tenantId,
          examId: activeExam.id,
          studentId: currentStudent.id,
          answers: answersArray
        },
        user
      );

      setExamSubmitted(true);
      setExamScore(submission.totalScore ?? 0);
      setMessage({ 
        type: 'success', 
        text: `Ujian berhasil diselesaikan! Skor Anda: ${submission.totalScore} (${submission.isPassed ? 'LULUS' : 'REMEDIAL'})` 
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengirimkan ujian' });
    }
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentStudent) return;

    try {
      cmsDb.createLeaveRequest(
        {
          tenantId,
          studentId: currentStudent.id,
          type: leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason
        },
        user
      );
      setLeaveReason('');
      setMessage({ type: 'success', text: 'Permohonan surat izin berhasil dikirim ke wali kelas!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengajukan izin' });
    }
  };

  if (!currentStudent) {
    return (
      <div className="bg-white p-12 text-center text-slate-500 rounded-xl border border-slate-200">
        Data profil siswa tidak ditemukan.
      </div>
    );
  }

  // Attendance rate
  const hadirCount = attendances.filter(a => a.status === 'HADIR').length;
  const attTotal = attendances.length || 1;
  const attendanceRate = Math.round((hadirCount / attTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Portal Mandiri Siswa
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            {currentStudent.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            NISN: {currentStudent.nisn || '-'} • NIS: {currentStudent.nis || '-'} • Kelas: {currentStudent.classId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('overview'); setActiveExam(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'overview' && !activeExam ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => { setActiveTab('cbt'); setActiveExam(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'cbt' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Ujian CBT ({examinations.length})
          </button>
          <button
            onClick={() => { setActiveTab('grades'); setActiveExam(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'grades' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Buku Rapor
          </button>
          <button
            onClick={() => { setActiveTab('leaves'); setActiveExam(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'leaves' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Surat Izin
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

      {/* CBT EXAM RUNNER */}
      {activeExam && !examSubmitted && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeExam.title}</h2>
              <p className="text-xs text-slate-500">Soal {currentQIndex + 1} dari {cbtQuestions.length}</p>
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-indigo-900 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>
                {Math.floor(cbtRemainingSeconds / 60)}:{(cbtRemainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Current Question */}
          {cbtQuestions[currentQIndex] && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-slate-900 font-medium text-sm leading-relaxed border border-slate-200">
                {cbtQuestions[currentQIndex].prompt}
              </div>

              {/* Options */}
              {Array.isArray(cbtQuestions[currentQIndex].options) && (
                <div className="space-y-2">
                  {cbtQuestions[currentQIndex].options.map((opt: any, optIdx: number) => {
                    const isSelected = cbtAnswers[cbtQuestions[currentQIndex].id] === opt.id;
                    return (
                      <div
                        key={opt.id || optIdx}
                        onClick={() => handleSelectAnswer(cbtQuestions[currentQIndex].id, opt.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition text-xs font-medium flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Question Navigator & Action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Sebelumnya
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              {cbtQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(i)}
                  className={`w-7 h-7 rounded text-xs font-bold ${
                    i === currentQIndex ? 'bg-indigo-600 text-white' :
                    cbtAnswers[q.id] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQIndex === cbtQuestions.length - 1 ? (
              <button
                onClick={handleSubmitCbt}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Selesaikan Ujian
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Berikutnya
              </button>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && !activeExam && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Tingkat Kehadiran</span>
              <div className="text-2xl font-bold font-mono text-emerald-600">{attendanceRate}%</div>
              <p className="text-[11px] text-slate-400">Total catatan: {attendances.length} sesi</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Ujian Telah Dikerjakan</span>
              <div className="text-2xl font-bold font-mono text-indigo-600">{submissions.length}</div>
              <p className="text-[11px] text-slate-400">Rata-rata skor: 85</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Status Akademik</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">AKTIF / LENGKAP</div>
              <p className="text-[11px] text-slate-400">Tahun Ajaran 2024/2025</p>
            </div>
          </div>

          {/* Recent Attendances */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Riwayat Kehadiran Terakhir
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendances.slice(0, 5).map(att => (
                    <tr key={att.id}>
                      <td className="py-2 px-3 font-mono">{att.date}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                          att.status === 'TERLAMBAT' ? 'bg-orange-100 text-orange-800' :
                          att.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{att.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CBT LIST TAB */}
      {activeTab === 'cbt' && !activeExam && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examinations.map(ex => {
            const alreadyDone = submissions.find(s => s.examId === ex.id);
            return (
              <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                      {ex.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{ex.durationMinutes} Menit</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{ex.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">KKM Kelulusan: {ex.passingGrade}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  {alreadyDone ? (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Selesai — Nilai: <b>{alreadyDone.totalScore}</b></span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartCbt(ex)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Kerjakan Ujian Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORT CARD TAB */}
      {activeTab === 'grades' && !activeExam && (
        <div className="space-y-4">
          {studentReports.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
              Belum ada buku rapor yang diterbitkan untuk akun ini.
            </div>
          ) : (
            studentReports.map(rp => (
              <div key={rp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Rapor Semester Genap 2024/2025</h3>
                    <p className="text-xs text-slate-500">Status: {rp.status}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
                  >
                    Cetak / Simpan PDF
                  </button>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold">
                      <th className="py-2 px-3">Mata Pelajaran</th>
                      <th className="py-2 px-3 text-center">Nilai Akhir</th>
                      <th className="py-2 px-3 text-center">Predikat</th>
                      <th className="py-2 px-3">Capaian Kompetensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(rp.grades || (rp.items as any) || []).map((g: any) => (
                      <tr key={g.subjectId}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{g.subjectName}</td>
                        <td className="py-2 px-3 text-center font-bold text-indigo-700 font-mono">{g.finalScore}</td>
                        <td className="py-2 px-3 text-center font-bold">{g.letterGrade}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{g.competencyDescription || g.competencyAchievement || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* LEAVES SUBMISSION TAB */}
      {activeTab === 'leaves' && !activeExam && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-lg mx-auto">
          <h3 className="font-bold text-slate-900 text-base">Kirim Surat Izin / Keterangan Sakit</h3>
          <form onSubmit={handleSubmitLeave} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Izin</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="SAKIT">Sakit (Dengan/Tanpa Surat Dokter)</option>
                <option value="IZIN">Izin Keperluan Keluarga</option>
                <option value="DISPENSASI">Dispensasi Lomba / Acara</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mulai Tanggal</label>
                <input
                  type="date"
                  required
                  value={leaveStartDate}
                  onChange={e => setLeaveStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  required
                  value={leaveEndDate}
                  onChange={e => setLeaveEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alasan Permohonan Izin</label>
              <textarea
                rows={3}
                required
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="Tuliskan keterangan sakit atau keperluan izin..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
            >
              Kirim Surat Izin ke Wali Kelas
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
