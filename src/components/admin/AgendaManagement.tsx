import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Clock,
  User,
  List,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';
import { EventItem, ActiveNav } from '../../types';
import { slugify, formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface AgendaManagementProps {
  events: EventItem[];
  onNavigate: (nav: ActiveNav) => void;
}

export const AgendaManagement: React.FC<AgendaManagementProps> = ({
  events,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState('Akademik & Sains');
  const [featuredImage, setFeaturedImage] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  const canManage = hasPermission(user, 'events.manage');

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setLocation('Auditorium Graha Nusantara');
    const now = new Date();
    setStartDate(now.toISOString().slice(0, 16));
    setEndDate('');
    setAllDay(false);
    setCategory('Akademik & Sains');
    setFeaturedImage('');
    setOrganizer('OSIS & Dewan Guru');
    setStatus('PUBLISHED');
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setSlug(ev.slug);
    setDescription(ev.description);
    setLocation(ev.location);
    setStartDate(ev.startDate ? ev.startDate.slice(0, 16) : '');
    setEndDate(ev.endDate ? ev.endDate.slice(0, 16) : '');
    setAllDay(ev.allDay);
    setCategory(ev.category || 'Akademik & Sains');
    setFeaturedImage(ev.featuredImage || '');
    setOrganizer(ev.organizer || '');
    setStatus(ev.status);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEvent) {
      setSlug(slugify(val));
    }
  };

  const handleSave = () => {
    if (!title.trim() || !startDate) {
      setErrorMessage('Judul agenda dan waktu mulai wajib diisi.');
      return;
    }

    try {
      if (editingEvent) {
        cmsStore.updateEvent(
          editingEvent.id,
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            description: description.trim(),
            location: location.trim(),
            startDate: new Date(startDate).toISOString(),
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            allDay,
            category,
            featuredImage: featuredImage.trim() || undefined,
            organizer: organizer.trim() || undefined,
            status,
          },
          user
        );
      } else {
        cmsStore.createEvent(
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            description: description.trim(),
            location: location.trim(),
            startDate: new Date(startDate).toISOString(),
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            allDay,
            category,
            featuredImage: featuredImage.trim() || undefined,
            organizer: organizer.trim() || undefined,
            status,
          },
          user
        );
      }
      setModalOpen(false);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyimpan agenda');
    }
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      cmsStore.deleteEvent(eventToDelete.id, user);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span>Manajemen Agenda & Kalender Kegiatan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwalkan olimpiade, workshop, ujian semester, pameran P5, dan pertemuan wali murid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
          </div>

          {canManage && (
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="gap-2 shrink-0 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Agenda Baru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kegiatan, lokasi, atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Events Display */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <EmptyState
                  title="Tidak ada agenda kegiatan ditemukan"
                  description="Tambahkan jadwal kegiatan sekolah untuk dipublikasikan pada kalender resmi."
                />
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((ev) => (
              <Card key={ev.id} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center shrink-0 text-blue-700 dark:text-blue-300">
                      <span className="text-xs font-bold uppercase">
                        {new Date(ev.startDate).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {new Date(ev.startDate).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="blue" className="text-[10px]">
                          {ev.category || 'Kegiatan'}
                        </Badge>
                        <Badge variant={ev.status === 'PUBLISHED' ? 'green' : 'gray'}>
                          {ev.status === 'PUBLISHED' ? 'Tayang' : 'Draf'}
                        </Badge>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {ev.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {ev.allDay
                            ? 'Sepanjang Hari'
                            : new Date(ev.startDate).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              }) + ' WIB'}
                        </span>
                        {ev.organizer && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {ev.organizer}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => openEditModal(ev)}
                        title="Edit Agenda"
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEventToDelete(ev);
                          setDeleteModalOpen(true);
                        }}
                        title="Hapus Agenda"
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Calendar Grid View */
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Kalender Agenda Sekolah (Tampilan Bulanan)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-colors space-y-2 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600">
                      {formatDate(ev.startDate)}
                    </span>
                    <Badge variant="blue" className="text-[9px]">
                      {ev.category}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {ev.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ev.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="truncate">{ev.location}</span>
                    {canManage && (
                      <button
                        onClick={() => openEditModal(ev)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingEvent ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Kegiatan / Agenda <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Olimpiade Sains Nusantara..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kategori Agenda
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="Akademik & Sains">Akademik & Sains</option>
                  <option value="Teknologi & Digital">Teknologi & Digital</option>
                  <option value="Seni & Kebudayaan">Seni & Kebudayaan</option>
                  <option value="Olahraga & Ekstrakurikuler">Olahraga & Ekstrakurikuler</option>
                  <option value="Administrasi & Komite">Administrasi & Komite</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="PUBLISHED">Tayang (Published)</option>
                  <option value="DRAFT">Draf (Draft)</option>
                  <option value="ARCHIVED">Arsip (Archived)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lokasi Tempat Pelaksanaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Auditorium Graha Nusantara / Lab Komputer"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Waktu Berakhir
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Berlangsung Sepanjang Hari (All Day)</span>
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Penyelenggara / Penanggung Jawab
              </label>
              <input
                type="text"
                placeholder="Contoh: Panitia P5 / Laboratorium Sains"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi Rincian Acara
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan agenda, susunan acara, peserta target, dan ketentuan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Simpan Agenda
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && eventToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Agenda"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus agenda{' '}
              <strong className="text-slate-900 dark:text-white">
                "{eventToDelete.title}"
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Hapus Agenda
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
