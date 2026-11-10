import React, { useState } from 'react';
import { 
  GraduationCap, Printer, Award, BookOpen, CheckCircle, 
  Search, Filter, Save, FileText, UserCheck, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { SemesterResult, UniversityTranscript } from '../../types';

interface UniversityGradesManagementProps {
  onNavigate?: (nav: string) => void;
}

export const UniversityGradesManagement: React.FC<UniversityGradesManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const students = cmsDb.getStudents(tenantId);
  const subjects = cmsDb.getSubjects(tenantId);

  const [activeTab, setActiveTab] = useState<'khs' | 'transcript'>('khs');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState<number>(2);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // KHS results
  const semesterResults = cmsDb.getSemesterResults(tenantId, selectedStudentId);
  const currentKhs = semesterResults.find(k => k.semesterNumber === selectedSemesterNumber);

  // Transcript
  const transcripts = cmsDb.getUniversityTranscripts(tenantId, selectedStudentId);
  const currentTranscript = transcripts[0];

  // Higher-ed courses in current KHS or default
  const khsCourses = currentKhs?.courses || [
    { code: 'MK-101', name: 'Algoritma & Struktur Data', credits: 4, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
    { code: 'MK-102', name: 'Basis Data Terdistribusi', credits: 3, gradeLetter: 'A-', gradePoint: 3.7, isPassed: true },
    { code: 'MK-103', name: 'Arsitektur Komputer', credits: 3, gradeLetter: 'B+', gradePoint: 3.3, isPassed: true },
    { code: 'MK-104', name: 'Matematika Diskrit', credits: 3, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
    { code: 'MK-105', name: 'Rekayasa Perangkat Lunak', credits: 4, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
    { code: 'MK-106', name: 'Kecerdasan Buatan', credits: 3, gradeLetter: 'B', gradePoint: 3.0, isPassed: true }
  ];

  // Calculate SKS and IPS
  const totalSks = khsCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalMutu = khsCourses.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
  const calculatedIps = totalSks > 0 ? Math.round((totalMutu / totalSks) * 100) / 100 : 0.0;

  const handleSaveKhs = () => {
    if (!user || !selectedStudent) return;
    try {
      cmsDb.upsertSemesterResult(
        {
          tenantId,
          studentId: selectedStudent.id,
          academicYearId: 'ay-2024-2025',
          semesterId: 'smt-2024-genap',
          semesterNumber: selectedSemesterNumber,
          creditsAttempted: totalSks,
          creditsEarned: totalSks,
          gpaSemester: calculatedIps,
          gpaCumulative: calculatedIps,
          courses: khsCourses,
          academicStatus: 'AKTIF',
          isPublished: true
        },
        user
      );
      setMessage({ type: 'success', text: `KHS Semester ${selectedSemesterNumber} untuk ${selectedStudent.fullName} berhasil disimpan!` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan KHS' });
    }
  };

  const handleGenerateOfficialTranscript = () => {
    if (!user || !selectedStudent) return;

    try {
      const allCourseList = [
        { code: 'MK-101', name: 'Algoritma & Struktur Data', credits: 4, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-102', name: 'Basis Data Terdistribusi', credits: 3, gradeLetter: 'A-', gradePoint: 3.7, isPassed: true },
        { code: 'MK-103', name: 'Arsitektur Komputer', credits: 3, gradeLetter: 'B+', gradePoint: 3.3, isPassed: true },
        { code: 'MK-104', name: 'Matematika Diskrit', credits: 3, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-105', name: 'Rekayasa Perangkat Lunak', credits: 4, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-106', name: 'Kecerdasan Buatan', credits: 3, gradeLetter: 'B', gradePoint: 3.0, isPassed: true },
        { code: 'MK-201', name: 'Jaringan Komputer & Cyber Security', credits: 4, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-202', name: 'Sistem Operasi Lanjut', credits: 3, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-203', name: 'Cloud Computing & Microservices', credits: 3, gradeLetter: 'A', gradePoint: 4.0, isPassed: true },
        { code: 'MK-401', name: 'Tugas Akhir / Skripsi', credits: 6, gradeLetter: 'A', gradePoint: 4.0, isPassed: true }
      ];

      const cumCredits = allCourseList.reduce((acc, c) => acc + c.credits, 0);
      const cumMutu = allCourseList.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
      const cumGpa = Math.round((cumMutu / cumCredits) * 100) / 100;
      const predicate = cumGpa >= 3.80 ? 'DENGAN PUJIAN (CUM LAUDE)' : cumGpa >= 3.50 ? 'SANGAT MEMUASKAN' : 'MEMUASKAN';

      cmsDb.upsertUniversityTranscript(
        {
          tenantId,
          studentId: selectedStudent.id,
          transcriptNumber: `TR/${new Date().getFullYear()}/${selectedStudent.nisn || '001'}`,
          totalCredits: cumCredits,
          gpaCumulative: cumGpa,
          honorsPredicate: predicate,
          thesisTitle: 'Implementasi Arsitektur Microservices Multi-Tenant pada Sistem Pendidikan Terpadu',
          issueDate: new Date().toISOString().split('T')[0],
          isOfficial: true,
          courses: allCourseList
        },
        user
      );

      setMessage({ type: 'success', text: 'Transkrip Akademik Resmi berhasil diterbitkan!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menerbitkan transkrip' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            KHS & Transkrip Akademik Perguruan Tinggi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penghitungan SKS, Indeks Prestasi Semester (IPS), Indeks Prestasi Kumulatif (IPK), dan pencetakan transkrip resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('khs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'khs' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kartu Hasil Studi (KHS)
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'transcript' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Transkrip Kumulatif
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition ml-2"
          >
            <Printer className="w-4 h-4" /> Cetak Dokumen
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

      {/* STUDENT SELECTOR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Mahasiswa</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.fullName} (NIM: {s.nisn || s.nis || '-'})</option>
            ))}
          </select>
        </div>

        {activeTab === 'khs' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={selectedSemesterNumber}
              onChange={e => setSelectedSemesterNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KHS VIEW */}
      {activeTab === 'khs' && selectedStudent && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              {currentTenant?.name || 'UNIVERSITAS TEKNOLOGI NUSANTARA'}
            </h2>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-800">
              KARTU HASIL STUDI (KHS) MAHASISWA
            </h3>
            <p className="text-xs text-slate-500">
              Semester {selectedSemesterNumber} • Tahun Akademik 2024/2025 Genap
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50">
            <div><b>Nama Mahasiswa:</b> {selectedStudent.fullName}</div>
            <div><b>Nomor Induk Mahasiswa (NIM):</b> {selectedStudent.nisn || selectedStudent.nis || '10202401'}</div>
            <div><b>Program Studi:</b> S1 Teknik Informatika</div>
            <div><b>Dosen Pembimbing Akademik:</b> Budi Santoso, M.Kom</div>
          </div>

          {/* TABLE OF COURSES */}
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300 uppercase">
                <th className="py-2 px-3 border-r border-slate-300 w-10 text-center">No</th>
                <th className="py-2 px-3 border-r border-slate-300 w-24">Kode MK</th>
                <th className="py-2 px-3 border-r border-slate-300">Nama Mata Kuliah</th>
                <th className="py-2 px-3 border-r border-slate-300 w-14 text-center">SKS (K)</th>
                <th className="py-2 px-3 border-r border-slate-300 w-14 text-center">Nilai (N)</th>
                <th className="py-2 px-3 border-r border-slate-300 w-16 text-center">Bobot (B)</th>
                <th className="py-2 px-3 text-center w-20">Mutu (K × B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {khsCourses.map((c, idx) => (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-center border-r border-slate-300">{idx + 1}</td>
                  <td className="py-2 px-3 font-mono border-r border-slate-300">{c.code}</td>
                  <td className="py-2 px-3 font-semibold border-r border-slate-300">{c.name}</td>
                  <td className="py-2 px-3 text-center font-mono border-r border-slate-300">{c.credits}</td>
                  <td className="py-2 px-3 text-center font-bold border-r border-slate-300 text-indigo-900">{c.gradeLetter}</td>
                  <td className="py-2 px-3 text-center font-mono border-r border-slate-300">{c.gradePoint.toFixed(1)}</td>
                  <td className="py-2 px-3 text-center font-mono font-bold">{(c.credits * c.gradePoint).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={3} className="py-2 px-3 text-right border-r border-slate-300">Total SKS & Mutu:</td>
                <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">{totalSks}</td>
                <td colSpan={2} className="py-2 px-3 border-r border-slate-300"></td>
                <td className="py-2 px-3 text-center font-mono">{totalMutu.toFixed(1)}</td>
              </tr>
            </tfoot>
          </table>

          {/* SUMMARY IP & SKS */}
          <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg flex items-center justify-around text-center">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Total SKS Semester</div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-1">{totalSks} SKS</div>
            </div>
            <div className="h-8 border-r border-slate-300"></div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Indeks Prestasi Semester (IPS)</div>
              <div className="text-2xl font-mono font-extrabold text-indigo-700 mt-1">{calculatedIps.toFixed(2)}</div>
            </div>
            <div className="h-8 border-r border-slate-300"></div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Maks SKS Semester Depan</div>
              <div className="text-xl font-mono font-bold text-emerald-700 mt-1">24 SKS</div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t print:hidden">
            <button
              onClick={handleSaveKhs}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
            >
              Simpan & Terbitkan KHS
            </button>
          </div>
        </div>
      )}

      {/* TRANSCRIPT VIEW */}
      {activeTab === 'transcript' && selectedStudent && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              {currentTenant?.name || 'UNIVERSITAS TEKNOLOGI NUSANTARA'}
            </h2>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-800">
              TRANSKRIP AKADEMIK RESMI (OFFICIAL ACADEMIC TRANSCRIPT)
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Nomor: {currentTranscript?.transcriptNumber || 'TR/2025/TI/001'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50">
            <div><b>Nama Lengkap:</b> {selectedStudent.fullName}</div>
            <div><b>Nomor Induk Mahasiswa (NIM):</b> {selectedStudent.nisn || selectedStudent.nis || '10202401'}</div>
            <div><b>Jenjang Pendidikan:</b> Strata Satu (S1)</div>
            <div><b>Program Studi:</b> Teknik Informatika</div>
            <div><b>Tanggal Kelulusan:</b> 15 Agustus 2025</div>
            <div><b>Predikat Kelulusan:</b> <b className="text-indigo-800">{currentTranscript?.honorsPredicate || 'DENGAN PUJIAN (CUM LAUDE)'}</b></div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800">Judul Skripsi / Tugas Akhir:</div>
            <p className="text-xs italic text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
              "{currentTranscript?.thesisTitle || 'Implementasi Arsitektur Microservices Multi-Tenant pada Sistem Pendidikan Terpadu'}"
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center justify-around text-center">
            <div>
              <div className="text-xs text-emerald-800 font-semibold uppercase">Total SKS Diperoleh</div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-1">{currentTranscript?.totalCredits || 144} SKS</div>
            </div>
            <div className="h-8 border-r border-emerald-200"></div>
            <div>
              <div className="text-xs text-emerald-800 font-semibold uppercase">Indeks Prestasi Kumulatif (IPK)</div>
              <div className="text-2xl font-mono font-extrabold text-emerald-800 mt-1">{currentTranscript?.gpaCumulative?.toFixed(2) || '3.88'}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t print:hidden">
            <button
              onClick={handleGenerateOfficialTranscript}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
            >
              Terbitkan Transkrip Resmi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
