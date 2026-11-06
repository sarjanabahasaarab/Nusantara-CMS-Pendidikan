import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RefreshCw,
  Info,
} from 'lucide-react';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

type ImportType = 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';

export const CsvImportExport: React.FC = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ImportType>('TEACHER');
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Hasil laporan import
  const [importReport, setImportReport] = useState<{
    successCount: number;
    failedCount: number;
    errors: { row: number; identifier: string; error: string }[];
  } | null>(null);

  // Template Contoh CSV per Tipe
  const TEMPLATES: Record<ImportType, string> = {
    TEACHER: `Nama,Email,Nomor HP,NIP,Mapel,Status Kepegawaian
Drs. Hendro Wibowo,hendro.wibowo@nusantara.sch.id,081234567890,198001012005011001,Sejarah Indonesia,PNS
Nurul Hidayah M.Pd,nurul.hidayah@nusantara.sch.id,081398765432,,Bahasa Inggris,HONORER`,
    STUDENT: `Nama Lengkap,NIS,NISN,Kelas,Email,Nomor HP
Ananda Putri Lestari,2026101,0091122334,X-A,ananda.putri@nusantara.sch.id,081911223344
Bima Arya Sena,2026102,0092233445,X-A,bima.arya@nusantara.sch.id,081955667788`,
    PARENT: `Nama Lengkap,Email,Nomor HP,Pekerjaan,Alamat
Bapak Ir. Hendra Saputra,hendra.saputra@gmail.com,081122334455,Arsitek,Jl. Cikini Raya No. 45
Ibu Dra. Melani Juwita,melani.juwita@gmail.com,081233445566,Dosen,Jl. Tebet Barat No. 12`,
    STAFF: `Nama Lengkap,Email,Nomor HP,NIK,Jabatan,Unit
Rahmat Hidayat S.Kom,rahmat.tu@nusantara.sch.id,081566778899,PEG-2026-041,Operator Dapodik & IT,Tata Usaha
Siti Nurhaliza A.Md,siti.kasir@nusantara.sch.id,081677889900,PEG-2026-042,Staf Kasir & SPP,Keuangan`,
  };

  const handleLoadTemplate = () => {
    const tpl = TEMPLATES[selectedType];
    setCsvRawText(tpl);
    parseCsv(tpl);
    setImportReport(null);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedRows([]);
      setHeaders([]);
      return;
    }

    const headerLine = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    setHeaders(headerLine);

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const rowObj: Record<string, string> = {};
      headerLine.forEach((h, index) => {
        rowObj[h] = cols[index] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvRawText(content);
      parseCsv(content);
      setImportReport(null);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) {
      alert('Tidak ada baris data CSV untuk diimpor.');
      return;
    }

    const report = cmsStore.importUsersCsv(selectedType, parsedRows, user);
    setImportReport(report);
  };

  const handleExportCsv = (roleFilter?: string) => {
    const csvContent = cmsStore.exportUsersCsv(roleFilter);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data-pengguna-nusantara-${roleFilter || 'semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Import & Export Data Massal (CSV)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Alat migrasi dan integrasi data batch untuk pendidik, siswa, orang tua, dan tenaga kependidikan (Section N).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Formulir Upload & Template */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                1. Pilih Kategori & Berkas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Data Impor:
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value as ImportType);
                    setParsedRows([]);
                    setCsvRawText('');
                    setImportReport(null);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="TEACHER">Tenaga Pendidik (Guru)</option>
                  <option value="STUDENT">Peserta Didik (Siswa)</option>
                  <option value="PARENT">Orang Tua / Wali Murid</option>
                  <option value="STAFF">Tenaga Kependidikan (Staff)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unggah Berkas CSV (.csv):
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/60 dark:file:text-emerald-300 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadTemplate}
                  className="w-full text-xs gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Gunakan Template Contoh CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Center Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Export Data Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Ekspor berkas CSV aman tanpa membocorkan kata sandi, token, atau informasi otentikasi rahasia.
              </p>
              <div className="flex flex-col gap-1.5 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleExportCsv()} className="justify-start text-xs">
                  Export Seluruh Pengguna
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportCsv('GURU')} className="justify-start text-xs">
                  Export Data Guru
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportCsv('SISWA')} className="justify-start text-xs">
                  Export Data Siswa
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportCsv('ORANG_TUA')} className="justify-start text-xs">
                  Export Data Orang Tua
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Preview Data & Laporan Hasil */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pratinjau Data CSV ({parsedRows.length} Baris Ditemukan)</span>
              </CardTitle>
              {parsedRows.length > 0 && (
                <Button variant="primary" size="sm" onClick={handleExecuteImport} className="text-xs gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi & Jalankan Impor
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {parsedRows.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-xs">
                  Unggah berkas CSV atau klik <strong>Gunakan Template Contoh CSV</strong> untuk melihat pratinjau kolom data di sini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2 w-8">#</th>
                        {headers.map((h) => (
                          <th key={h} className="p-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {parsedRows.slice(0, 8).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                          {headers.map((h) => (
                            <td key={h} className="p-2 truncate max-w-[180px]">
                              {row[h] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 8 && (
                    <div className="p-2 text-center text-slate-500 text-[11px] bg-slate-50 dark:bg-slate-800/40">
                      Menampilkan 8 dari {parsedRows.length} baris data...
                    </div>
                  )}
                </div>
              )}

              {/* Laporan Hasil Impor (Section N) */}
              {importReport && (
                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Berhasil: {importReport.successCount}
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                      <XCircle className="w-4 h-4" />
                      Gagal: {importReport.failedCount}
                    </div>
                  </div>

                  {importReport.errors.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                        Daftar Baris Bermasalah (Deteksi Duplikasi & Kesalahan Kolom):
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {importReport.errors.map((err, i) => (
                          <div
                            key={i}
                            className="p-2 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-2"
                          >
                            <span>
                              <strong>Baris {err.row}</strong> ({err.identifier}): {err.error}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
