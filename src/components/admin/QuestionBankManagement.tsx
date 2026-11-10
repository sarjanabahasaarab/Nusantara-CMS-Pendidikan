import React, { useState } from 'react';
import { 
  FileQuestion, Plus, Trash2, Edit3, Eye, CheckCircle2, 
  Search, Filter, BookOpen, Layers, Save, HelpCircle, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  QuestionBank, Question, QuestionType, DifficultyLevel, 
  CognitiveLevel 
} from '../../types';

interface QuestionBankManagementProps {
  onNavigate?: (nav: string) => void;
}

export const QuestionBankManagement: React.FC<QuestionBankManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const subjects = cmsDb.getSubjects(tenantId);
  const questionBanks = cmsDb.getQuestionBanks(tenantId);

  const [selectedBankId, setSelectedBankId] = useState<string>(questionBanks[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewBankModal, setShowNewBankModal] = useState<boolean>(false);
  const [showNewQuestionModal, setShowNewQuestionModal] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Bank form
  const [newBankTitle, setNewBankTitle] = useState<string>('');
  const [newBankSubjectId, setNewBankSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newBankGradeLevel, setNewBankGradeLevel] = useState<string>('Kelas X');
  const [newBankDesc, setNewBankDesc] = useState<string>('');

  // New Question form
  const [qType, setQType] = useState<QuestionType>('PILIHAN_GANDA');
  const [qPrompt, setQPrompt] = useState<string>('');
  const [qPoints, setQPoints] = useState<number>(10);
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>('SEDANG');
  const [qCognitive, setQCognitive] = useState<CognitiveLevel>('C3');
  const [qExplanation, setQExplanation] = useState<string>('');
  
  // Options for PG / PGK
  const [options, setOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([
    { id: 'opt-1', text: '', isCorrect: true },
    { id: 'opt-2', text: '', isCorrect: false },
    { id: 'opt-3', text: '', isCorrect: false },
    { id: 'opt-4', text: '', isCorrect: false },
  ]);

  // Matching pairs
  const [pairs, setPairs] = useState<Array<{ left: string; right: string }>>([
    { left: 'Premis 1', right: 'Jawaban 1' },
    { left: 'Premis 2', right: 'Jawaban 2' }
  ]);

  // True/false correct answer
  const [tfCorrect, setTfCorrect] = useState<string>('BENAR');

  const selectedBank = questionBanks.find(b => b.id === selectedBankId);
  const questionsInBank = selectedBank ? cmsDb.getQuestions(tenantId, selectedBank.id) : [];

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const bank = cmsDb.createQuestionBank(
        {
          tenantId,
          subjectId: newBankSubjectId,
          title: newBankTitle,
          code: newBankTitle.toUpperCase().replace(/\s+/g, '_').substring(0, 15),
          description: newBankDesc,
          gradeLevel: newBankGradeLevel
        },
        user
      );
      setShowNewBankModal(false);
      setNewBankTitle('');
      setSelectedBankId(bank.id);
      setMessage({ type: 'success', text: `Bank soal "${bank.title}" berhasil dibuat.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membuat bank soal' });
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBankId) return;

    let payloadOptions: any = undefined;
    let payloadCorrectAnswer: any = undefined;

    if (qType === 'PILIHAN_GANDA') {
      payloadOptions = options.map(o => ({ id: o.id, text: o.text }));
      const correct = options.find(o => o.isCorrect);
      payloadCorrectAnswer = correct ? correct.id : options[0]?.id;
    } else if (qType === 'PILIHAN_GANDA_KOMPLEKS') {
      payloadOptions = options.map(o => ({ id: o.id, text: o.text }));
      payloadCorrectAnswer = options.filter(o => o.isCorrect).map(o => o.id);
    } else if (qType === 'BENAR_SALAH') {
      payloadCorrectAnswer = tfCorrect;
    } else if (qType === 'MENJODOHKAN') {
      payloadOptions = pairs;
      payloadCorrectAnswer = pairs;
    }

    try {
      cmsDb.createQuestion(
        {
          tenantId,
          bankId: selectedBankId,
          type: qType,
          prompt: qPrompt,
          options: payloadOptions,
          correctAnswer: payloadCorrectAnswer,
          points: qPoints,
          difficulty: qDifficulty,
          cognitiveLevel: qCognitive,
          explanation: qExplanation
        },
        user
      );

      setShowNewQuestionModal(false);
      setQPrompt('');
      setQExplanation('');
      setMessage({ type: 'success', text: 'Butir soal baru berhasil ditambahkan ke bank soal!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menambahkan soal' });
    }
  };

  const filteredQuestions = questionsInBank.filter(q =>
    (q.prompt || q.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileQuestion className="w-7 h-7 text-indigo-600" />
            Bank Soal & Butir Ujian
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gudang butir instrumen tes terstruktur (PG, PG Kompleks, Benar/Salah, Menjodohkan, Esai) dengan taksonomi Bloom.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewBankModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
          >
            <Plus className="w-4 h-4" /> Bank Soal Baru
          </button>
          <button
            disabled={!selectedBankId}
            onClick={() => setShowNewQuestionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm transition disabled:bg-slate-300"
          >
            <Plus className="w-4 h-4" /> Tambah Butir Soal
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

      {/* SELECTOR & BANK DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Bank List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Daftar Bank Soal
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{questionBanks.length} Bank</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {questionBanks.map(b => {
              const subj = subjects.find(s => s.id === b.subjectId);
              const isSelected = b.id === selectedBankId;
              const count = cmsDb.getQuestions(tenantId, b.id).length;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBankId(b.id)}
                  className={`p-3 rounded-lg cursor-pointer border transition text-xs ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium' 
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold">{b.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{subj?.name || 'Mata Pelajaran'}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">{count} Soal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Question List in selected bank */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {selectedBank ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedBank.title}</h2>
                  <p className="text-xs text-slate-500">
                    Jenjang: <b>{selectedBank.gradeLevel}</b> • Total Butir: <b>{questionsInBank.length} Soal</b>
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari butir soal..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Belum ada butir soal di bank ini. Klik "Tambah Butir Soal" di atas.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800">
                            {q.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            q.difficulty === 'MUDAH' ? 'bg-emerald-100 text-emerald-800' :
                            q.difficulty === 'SEDANG' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                            Taksonomi: {q.cognitiveLevel}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-indigo-600">Bobot: {q.points} Poin</span>
                      </div>

                      <div className="text-xs text-slate-900 font-medium whitespace-pre-wrap">
                        {q.prompt}
                      </div>

                      {/* Display Options if applicable */}
                      {Array.isArray(q.options) && q.type === 'PILIHAN_GANDA' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          {q.options.map((opt: any, optIdx: number) => {
                            const isCorrect = q.correctAnswer === opt.id;
                            return (
                              <div
                                key={opt.id || optIdx}
                                className={`p-2 rounded border flex items-center justify-between ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}. {opt.text}</span>
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                          <b className="text-slate-800">Pembahasan:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Pilih salah satu bank soal di sebelah kiri atau buat bank baru.
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW QUESTION MODAL */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Tambah Butir Soal Baru</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Soal</label>
                  <select
                    value={qType}
                    onChange={e => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="PILIHAN_GANDA">Pilihan Ganda Biasa</option>
                    <option value="PILIHAN_GANDA_KOMPLEKS">Pilihan Ganda Kompleks</option>
                    <option value="BENAR_SALAH">Benar / Salah</option>
                    <option value="MENJODOHKAN">Menjodohkan (Matching)</option>
                    <option value="ESAI">Esai / Uraian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={qDifficulty}
                    onChange={e => setQDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="MUDAH">Mudah</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="SULIT">Sulit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kognitif (Bloom)</label>
                  <select
                    value={qCognitive}
                    onChange={e => setQCognitive(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="C1">C1 - Mengingat</option>
                    <option value="C2">C2 - Memahami</option>
                    <option value="C3">C3 - Menerapkan</option>
                    <option value="C4">C4 - Menganalisis</option>
                    <option value="C5">C5 - Mengevaluasi</option>
                    <option value="C6">C6 - Mencipta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pertanyaan / Stimulus / Butir Soal</label>
                <textarea
                  required
                  rows={3}
                  value={qPrompt}
                  onChange={e => setQPrompt(e.target.value)}
                  placeholder="Tuliskan stimulus narasi atau pertanyaan butir soal di sini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Tipe Pilihan Ganda Form */}
              {(qType === 'PILIHAN_GANDA' || qType === 'PILIHAN_GANDA_KOMPLEKS') && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Pilihan Opsi Jawaban (Tandai yang benar)</label>
                  {options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type={qType === 'PILIHAN_GANDA' ? 'radio' : 'checkbox'}
                        name="correctOpt"
                        checked={opt.isCorrect}
                        onChange={() => {
                          if (qType === 'PILIHAN_GANDA') {
                            setOptions(options.map(o => ({ ...o, isCorrect: o.id === opt.id })));
                          } else {
                            setOptions(options.map(o => o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="font-mono font-bold w-4">{String.fromCharCode(65 + i)}.</span>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={e => {
                          const val = e.target.value;
                          setOptions(options.map(o => o.id === opt.id ? { ...o, text: val } : o));
                        }}
                        placeholder={`Teks pilihan ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tipe Benar / Salah */}
              {qType === 'BENAR_SALAH' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kunci Jawaban Yang Benar</label>
                  <select
                    value={tfCorrect}
                    onChange={e => setTfCorrect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="BENAR">Pernyataan Bernilai BENAR</option>
                    <option value="SALAH">Pernyataan Bernilai SALAH</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Poin</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={qPoints}
                    onChange={e => setQPoints(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pembahasan Soal (Opsional)</label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                    placeholder="Penjelasan ringkas jawaban..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW BANK MODAL */}
      {showNewBankModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Buat Bank Soal Baru</h3>
            <form onSubmit={handleCreateBank} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Bank Soal</label>
                <input
                  type="text"
                  required
                  value={newBankTitle}
                  onChange={e => setNewBankTitle(e.target.value)}
                  placeholder="Contoh: Bank Soal Matematika Fase E 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={newBankSubjectId}
                  onChange={e => setNewBankSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat / Fase</label>
                <input
                  type="text"
                  value={newBankGradeLevel}
                  onChange={e => setNewBankGradeLevel(e.target.value)}
                  placeholder="Contoh: Kelas X / Fase E"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={newBankDesc}
                  onChange={e => setNewBankDesc(e.target.value)}
                  placeholder="Deskripsi materi atau standar kompetensi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewBankModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Buat Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
