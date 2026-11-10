import React, { useState } from 'react';
import { 
  CheckSquare, ArrowUpRight, GraduationCap, Users, 
  AlertCircle, CheckCircle, Search, Filter, Save, FileText, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { AcademicDecision, AcademicDecisionType, DecisionResult } from '../../types';

interface AcademicDecisionsManagementProps {
  onNavigate?: (nav: string) => void;
}

export const AcademicDecisionsManagement: React.FC<AcademicDecisionsManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const classes = cmsDb.getClasses(tenantId);
  const academicYears = cmsDb.getAcademicYears(tenantId);
  const activeYear = academicYears.find(y => y.isActive) || academicYears[0];

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [decisionType, setDecisionType] = useState<AcademicDecisionType>('KENAIKAN_KELAS');
  const [targetNextClassId, setTargetNextClassId] = useState<string>(classes[1]?.id || classes[0]?.id || '');
  const [meetingSkNumber, setMeetingSkNumber] = useState<string>('421/089/SK-PLENO/2025');
  const [meetingNotes, setMeetingNotes] = useState<string>('Berdasarkan hasil rapat dewan guru dan pertimbangan nilai rapor serta kehadiran.');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const studentsInClass = cmsDb.getStudents(tenantId).filter(s => s.classId === selectedClassId);

  // Existing decisions
  const existingDecisions = cmsDb.getAcademicDecisions(tenantId, {
    academicYearId: activeYear?.id
  });

  // Local state mapping studentId -> DecisionResult
  const [decisionsMap, setDecisionsMap] = useState<Record<string, { result: DecisionResult; notes: string }>>({});

  React.useEffect(() => {
    const map: Record<string, { result: DecisionResult; notes: string }> = {};
    studentsInClass.forEach(st => {
      const found = existingDecisions.find(d => d.studentId === st.id);
      map[st.id] = {
        result: found ? found.result : (decisionType === 'KENAIKAN_KELAS' ? 'NAIK_KELAS' : 'LULUS'),
        notes: found ? (found.notes || '') : 'Memenuhi seluruh kriteria kelulusan dan kehadiran minimum'
      };
    });
    setDecisionsMap(map);
  }, [selectedClassId, decisionType, existingDecisions.length]);

  const handleResultChange = (studentId: string, result: DecisionResult) => {
    setDecisionsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        result
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setDecisionsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleExecuteDecisions = () => {
    if (!user) return;

    try {
      studentsInClass.forEach(st => {
        const d = decisionsMap[st.id] || { result: 'NAIK_KELAS', notes: '' };
        cmsDb.recordAcademicDecision(
          {
            tenantId,
            studentId: st.id,
            academicYearId: activeYear?.id || '',
            decisionType,
            result: d.result,
            targetClassId: d.result === 'NAIK_KELAS' ? targetNextClassId : undefined,
            meetingDate: new Date().toISOString().split('T')[0],
            skNumber: meetingSkNumber,
            notes: d.notes
          },
          user
        );
      });

      setMessage({ 
        type: 'success', 
        text: `Keputusan sidang pleno berhasil ditetapkan untuk ${studentsInClass.length} siswa!` 
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menetapkan keputusan akademik' });
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" />
            Keputusan Kenaikan Kelas & Kelulusan (Sidang Pleno)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penetapan kenaikan kelas atau kelulusan siswa secara yuridis dengan nomor SK resmi dan update status alumni.
          </p>
        </div>

        <button
          onClick={handleExecuteDecisions}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
        >
          <Save className="w-4 h-4" /> Tetapkan & Eksekusi Hasil Sidang
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* PLENO CONFIGURATION FORM */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Keputusan</label>
          <select
            value={decisionType}
            onChange={e => setDecisionType(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
          >
            <option value="KENAIKAN_KELAS">Kenaikan Kelas (Tingkat Antara)</option>
            <option value="KELULUSAN">Kelulusan Akhir (Tingkat Akhir)</option>
          </select>
        </div>

        {decisionType === 'KENAIKAN_KELAS' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Promosi Ke Kelas Berikutnya</label>
            <select
              value={targetNextClassId}
              onChange={e => setTargetNextClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor SK Penetapan</label>
          <input
            type="text"
            value={meetingSkNumber}
            onChange={e => setMeetingSkNumber(e.target.value)}
            placeholder="Nomor SK Sidang..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
          />
        </div>
      </div>

      {/* STUDENT DECISIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-700">
            Daftar Peserta Didik Kelas <b>{selectedClass?.name}</b> ({studentsInClass.length} Siswa)
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            Tahun Ajaran: {activeYear?.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 w-28">NISN</th>
                <th className="py-2.5 px-3 w-44">Keputusan Sidang</th>
                <th className="py-2.5 px-3">Alasan / Catatan Pertimbangan Pleno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentsInClass.map((st, idx) => {
                const dec = decisionsMap[st.id] || { result: 'NAIK_KELAS', notes: '' };
                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{st.nisn || '-'}</td>
                    <td className="py-2.5 px-3">
                      <select
                        value={dec.result}
                        onChange={e => handleResultChange(st.id, e.target.value as DecisionResult)}
                        className={`w-full px-2.5 py-1 rounded border text-xs font-bold ${
                          dec.result === 'NAIK_KELAS' || dec.result === 'LULUS'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {decisionType === 'KENAIKAN_KELAS' ? (
                          <>
                            <option value="NAIK_KELAS">NAIK KELAS</option>
                            <option value="TINGGAL_KELAS">TINGGAL KELAS</option>
                          </>
                        ) : (
                          <>
                            <option value="LULUS">LULUS (ALUMNI)</option>
                            <option value="TIDAK_LULUS">TIDAK LULUS</option>
                            <option value="DITUNDA">DITUNDA</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={dec.notes}
                        onChange={e => handleNotesChange(st.id, e.target.value)}
                        placeholder="Catatan rapat..."
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
