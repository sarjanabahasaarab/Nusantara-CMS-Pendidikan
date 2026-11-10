import React, { useState } from 'react';
import { 
  FileSpreadsheet, Printer, CheckCircle, Clock, Check, 
  Search, Filter, Save, AlertCircle, Award, User, RefreshCw, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { ReportCard, ReportCardStatus } from '../../types';

interface ReportCardManagementProps {
  onNavigate?: (nav: string) => void;
}

export const ReportCardManagement: React.FC<ReportCardManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const classes = cmsDb.getClasses(tenantId);
  const subjects = cmsDb.getSubjects(tenantId);
  const academicYears = cmsDb.getAcademicYears(tenantId);
  const activeYear = academicYears.find(y => y.isActive) || academicYears[0];

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const studentsInClass = cmsDb.getStudents(tenantId).filter(s => s.classId === selectedClassId);

  React.useEffect(() => {
    if (studentsInClass.length > 0 && (!selectedStudentId || !studentsInClass.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(studentsInClass[0].id);
    }
  }, [studentsInClass, selectedStudentId]);

  const selectedStudent = studentsInClass.find(s => s.id === selectedStudentId);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Existing report card for this student and year
  const reportCards = cmsDb.getReportCards(tenantId, {
    classId: selectedClassId,
    academicYearId: activeYear?.id
  });
  const currentReportCard = reportCards.find(r => r.studentId === selectedStudentId);

  // Editable fields for homeroom teacher
  const [homeroomNotes, setHomeroomNotes] = useState<string>(
    currentReportCard?.homeroomTeacherNotes || 'Menunjukkan peningkatan yang sangat baik dalam literasi dan kemandirian belajar.'
  );
  const [headmasterNotes, setHeadmasterNotes] = useState<string>(
    currentReportCard?.headmasterNotes || 'Pertahankan prestasi belajar dan terus tingkatkan kedisiplinan.'
  );

  React.useEffect(() => {
    if (currentReportCard) {
      setHomeroomNotes(currentReportCard.homeroomTeacherNotes || '');
      setHeadmasterNotes(currentReportCard.headmasterNotes || '');
    }
  }, [currentReportCard?.id]);

  // Handle Calculate & Generate Report Card
  const handleGenerateReportCard = () => {
    if (!user || !selectedStudent) return;

    try {
      // 1. Gather all subject grades for this student
      const studentGrades = subjects.map(sub => {
        const comps = cmsDb.getAssessmentComponents(tenantId, {
          classId: selectedClassId,
          subjectId: sub.id,
          academicYearId: activeYear?.id
        });

        let totalWeighted = 0;
        let totalWeight = 0;
        const compSummaries: any[] = [];

        comps.forEach(c => {
          const ass = cmsDb.getStudentAssessments(tenantId, { componentId: c.id })
            .find(a => a.studentId === selectedStudent.id);
          const passingGrade = (c as any).passingGrade ?? (c as any).minPassingGrade ?? 75;
          const score = ass ? ass.score : passingGrade;
          totalWeighted += score * (c.weight / 100);
          totalWeight += c.weight;
          compSummaries.push({
            name: c.name,
            score,
            weight: c.weight,
            passed: score >= passingGrade
          });
        });

        const finalScore = totalWeight > 0 ? Math.round((totalWeighted / (totalWeight / 100)) * 10) / 10 : 80;
        const letter = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

        return {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          passingGrade: (sub as any).passingGrade || sub.minPassingGrade || 75,
          finalScore,
          letterGrade: letter,
          competencyDescription: `Menunjukkan penguasaan sangat baik dalam materi ${sub.name}`,
          components: compSummaries
        };
      });

      // 2. Gather attendance summary
      const studentAtts = cmsDb.getStudentAttendances(tenantId, { studentId: selectedStudent.id });
      const attendanceSummary = {
        hadir: studentAtts.filter(a => a.status === 'HADIR').length,
        sakit: studentAtts.filter(a => a.status === 'SAKIT').length,
        izin: studentAtts.filter(a => a.status === 'IZIN').length,
        alpa: studentAtts.filter(a => a.status === 'ALPA').length,
        terlambat: studentAtts.filter(a => a.status === 'TERLAMBAT').length,
        dispensasi: studentAtts.filter(a => a.status === 'DISPENSASI').length,
      };

      // 3. Extracurriculars
      const extracurriculars = [
        { name: 'Pramuka Inti', score: 'A', description: 'Aktif dalam kegiatan kepemimpinan dan pioneering' },
        { name: 'Klub Robotik & Coding', score: 'A', description: 'Menunjukkan kreativitas dalam pemrograman mikrokontroler' }
      ];

      // 4. Save or update report card
      cmsDb.upsertReportCard(
        {
          tenantId,
          studentId: selectedStudent.id,
          classId: selectedClassId,
          academicYearId: activeYear?.id || '',
          semesterId: 'smt-2024-genap',
          status: 'DRAFT',
          grades: studentGrades,
          attendanceSummary,
          extracurriculars,
          homeroomTeacherNotes: homeroomNotes,
          headmasterNotes: headmasterNotes
        },
        user
      );

      setMessage({ type: 'success', text: `Rapor peserta didik ${selectedStudent.fullName} berhasil dikompilasi!` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyusun rapor' });
    }
  };

  const handleUpdateStatus = (newStatus: ReportCardStatus) => {
    if (!user || !currentReportCard) return;

    try {
      cmsDb.updateReportCardStatus(currentReportCard.id, newStatus, user);
      setMessage({ type: 'success', text: `Status persetujuan rapor diperbarui menjadi: ${newStatus}` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah status rapor' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            Buku Rapor & Hasil Belajar Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kompilasi rapor Kurikulum Merdeka, deskripsi capaian kompetensi, catatan wali kelas, dan cetak format resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentReportCard && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
            >
              <Printer className="w-4 h-4" /> Cetak Rapor
            </button>
          )}

          <button
            onClick={handleGenerateReportCard}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" /> Hitung & Kompilasi Rapor
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium print:hidden ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* CLASS & STUDENT SELECTOR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Peserta Didik</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {studentsInClass.map(s => (
              <option key={s.id} value={s.id}>{s.fullName} ({s.nisn || '-'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* APPROVAL STATUS PIPELINE BAR */}
      {currentReportCard && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Alur Persetujuan Rapor:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              currentReportCard.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
              currentReportCard.status === 'CHECKED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentReportCard.status === 'APPROVED' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              Status: {currentReportCard.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateStatus('DRAFT')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                currentReportCard.status === 'DRAFT' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => handleUpdateStatus('CHECKED')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                currentReportCard.status === 'CHECKED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Checked (Wali Kelas)
            </button>
            <button
              onClick={() => handleUpdateStatus('APPROVED')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                currentReportCard.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Approved (Kepala Sekolah)
            </button>
          </div>
        </div>
      )}

      {/* REPORT CARD DOCUMENT VIEW (PRINTABLE) */}
      {selectedStudent && currentReportCard ? (
        <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
          {/* KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              PEMERINTAH PROVINSI / DAERAH
            </h2>
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900">
              {currentTenant?.name || 'SEKOLAH NUSANTARA'}
            </h3>
            <p className="text-xs text-slate-600">
              {currentTenant?.address || 'Jl. Pendidikan Nasional No. 45'} • Email: info@sekolah.sch.id • Telp: (021) 7890123
            </p>
          </div>

          <div className="text-center py-2">
            <h1 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
            </h1>
            <p className="text-xs text-slate-500">Tahun Ajaran {activeYear?.name || '2024/2025'} — Semester Genap</p>
          </div>

          {/* STUDENT IDENTITIES */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50/50">
            <div><b>Nama Peserta Didik:</b> {selectedStudent.fullName}</div>
            <div><b>Kelas:</b> {selectedClass?.name}</div>
            <div><b>Nomor Induk / NISN:</b> {selectedStudent.nisn || selectedStudent.nis || '-'}</div>
            <div><b>Fase / Kurikulum:</b> Kurikulum Merdeka (Fase E)</div>
          </div>

          {/* SUBJECT GRADES TABLE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-800">A. Nilai Akademik & Capaian Pembelajaran</h4>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-300">
                  <th className="py-2 px-3 border-r border-slate-300 w-10 text-center">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">Mata Pelajaran</th>
                  <th className="py-2 px-3 border-r border-slate-300 w-16 text-center">KKM</th>
                  <th className="py-2 px-3 border-r border-slate-300 w-16 text-center">Nilai</th>
                  <th className="py-2 px-3 border-r border-slate-300 w-14 text-center">Huruf</th>
                  <th className="py-2 px-3">Capaian Kompetensi (Deskripsi Pembelajaran)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {(currentReportCard.grades || (currentReportCard.items as any) || []).map((g: any, idx: number) => (
                  <tr key={g.subjectId} className="border-b border-slate-200">
                    <td className="py-2 px-3 text-center border-r border-slate-300">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold border-r border-slate-300">{g.subjectName}</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">{g.passingGrade || g.kkm || 75}</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-mono font-bold text-indigo-900">{g.finalScore}</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">{g.letterGrade}</td>
                    <td className="py-2 px-3 text-slate-700 text-[11px] leading-relaxed">{g.competencyDescription || g.competencyAchievement || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EXTRACURRICULARS & ATTENDANCE SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extracurriculars */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase text-slate-800">B. Kegiatan Ekstrakurikuler</h4>
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="py-1.5 px-2 border-r border-slate-300">Kegiatan</th>
                    <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">Predikat</th>
                    <th className="py-1.5 px-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {currentReportCard.extracurriculars?.map((ek, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-medium">{ek.name}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold">{ek.score}</td>
                      <td className="py-1.5 px-2 text-[11px]">{ek.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Summary */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase text-slate-800">C. Rekapitulasi Presensi</h4>
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="py-1.5 px-3 border-r border-slate-300">Sakit (S)</td>
                    <td className="py-1.5 px-3 font-mono font-bold">{currentReportCard.attendanceSummary?.sakit || 0} hari</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 border-r border-slate-300">Izin (I)</td>
                    <td className="py-1.5 px-3 font-mono font-bold">{currentReportCard.attendanceSummary?.izin || 0} hari</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 border-r border-slate-300">Tanpa Keterangan / Alpa (A)</td>
                    <td className="py-1.5 px-3 font-mono font-bold">{currentReportCard.attendanceSummary?.alpa || 0} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TEACHER & HEADMASTER NOTES */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-800">D. Catatan Wali Kelas & Kepala Sekolah</h4>
            <div className="border border-slate-300 p-3 rounded text-xs space-y-2">
              <div>
                <b>Catatan Wali Kelas:</b>
                <p className="italic text-slate-700 mt-0.5">{currentReportCard.homeroomTeacherNotes}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <b>Pesan Kepala Sekolah:</b>
                <p className="italic text-slate-700 mt-0.5">{currentReportCard.headmasterNotes}</p>
              </div>
            </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-600">Orang Tua / Wali,</p>
              <div className="h-16"></div>
              <p className="font-bold border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">( ................................ )</p>
            </div>

            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="text-slate-600">Kepala Sekolah</p>
              <div className="h-12"></div>
              <p className="font-bold border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">Dr. H. Sulaiman, M.Pd</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP: 197508122000031002</p>
            </div>

            <div>
              <p className="text-slate-600">Jakarta, 20 Juni 2025</p>
              <p className="text-slate-600">Wali Kelas</p>
              <div className="h-12"></div>
              <p className="font-bold border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">Budi Santoso, S.Pd</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP: 198203152008011012</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          <p>Belum ada data rapor yang dikompilasi untuk siswa terpilih.</p>
          <button
            onClick={handleGenerateReportCard}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs"
          >
            Kompilasi Rapor Siswa Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
