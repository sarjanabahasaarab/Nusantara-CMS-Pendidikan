/**
 * Nusantara Education CMS - Manajemen Ruang Belajar & Laboratorium
 * Phase 4 - Facilities & Classroom Capacity Tracking
 */

import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Building,
  Monitor,
  FlaskConical,
  BookOpen,
  Layers,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { Room } from '../../types';

interface RoomsManagementProps {
  onNavigate: (view: any) => void;
}

export const RoomsManagement: React.FC<RoomsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();

  const [rooms, setRooms] = useState<Room[]>(cmsStore.getRooms(tenantId));
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formBuilding, setFormBuilding] = useState('');
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(40);
  const [formRoomType, setFormRoomType] = useState('CLASSROOM');
  const [formFacilities, setFormFacilities] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const refreshData = () => {
    setRooms(cmsStore.getRooms(tenantId));
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.building && r.building.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || r.roomType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedRoomId(null);
    setFormCode('');
    setFormName('');
    setFormBuilding('Gedung Utama');
    setFormFloor(1);
    setFormCapacity(36);
    setFormRoomType('CLASSROOM');
    setFormFacilities('Smart Board, AC, WiFi');
    setFormNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setIsEditing(true);
    setSelectedRoomId(room.id);
    setFormCode(room.code);
    setFormName(room.name);
    setFormBuilding(room.building || '');
    setFormFloor(room.floor || 1);
    setFormCapacity(room.capacity);
    setFormRoomType(room.roomType || room.type || 'TEORI');
    if (Array.isArray(room.facilities)) {
      setFormFacilities(room.facilities.join(', '));
    } else if (typeof room.facilities === 'string') {
      try {
        const parsed = JSON.parse(room.facilities);
        setFormFacilities(Array.isArray(parsed) ? parsed.join(', ') : room.facilities);
      } catch {
        setFormFacilities(room.facilities);
      }
    } else {
      setFormFacilities('');
    }
    setFormNotes(room.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const facilityArray = formFacilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && selectedRoomId) {
      cmsStore.updateRoom(selectedRoomId, {
        code: formCode,
        name: formName,
        building: formBuilding,
        floor: Number(formFloor),
        capacity: Number(formCapacity),
        roomType: formRoomType as any,
        facilities: JSON.stringify(facilityArray),
        notes: formNotes,
      }, user);
    } else {
      cmsStore.createRoom({
        tenantId,
        code: formCode,
        name: formName,
        building: formBuilding,
        floor: Number(formFloor),
        capacity: Number(formCapacity),
        roomType: formRoomType as any,
        facilities: JSON.stringify(facilityArray),
        isAvailable: true,
        notes: formNotes,
      }, user);
    }
    refreshData();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus ruang belajar ini?')) {
      cmsStore.deleteRoom(id, user);
      refreshData();
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'LAB_COMPUTER':
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'LAB_SCIENCE':
        return <FlaskConical className="w-5 h-5 text-emerald-600" />;
      case 'LIBRARY':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      default:
        return <DoorOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <DoorOpen className="w-7 h-7 text-blue-600" />
            Sarana Belajar & Ruang Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen ruang kelas teori, laboratorium komputasi/sains, bengkel kerja, dan aula.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Ruangan
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama ruang, kode, atau gedung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="ALL">Semua Tipe Ruangan</option>
          <option value="CLASSROOM">Kelas Teori</option>
          <option value="LAB_COMPUTER">Lab Komputer & AI</option>
          <option value="LAB_SCIENCE">Lab Sains (Fisika/Kimia/Biologi)</option>
          <option value="AUDITORIUM">Aula / Auditorium</option>
          <option value="WORKSHOP">Bengkel / Workshop</option>
          <option value="LIBRARY">Perpustakaan</option>
        </select>
      </div>

      {/* Grid Ruangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          let facilities: string[] = [];
          if (Array.isArray(room.facilities)) {
            facilities = room.facilities;
          } else if (typeof room.facilities === 'string') {
            try {
              const parsed = JSON.parse(room.facilities);
              facilities = Array.isArray(parsed) ? parsed : [room.facilities];
            } catch {
              facilities = [room.facilities];
            }
          }

          return (
            <div
              key={room.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getRoomIcon(room.roomType || room.type || '')}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {room.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{room.name}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Tersedia
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lokasi Gedung:</span>
                    <span className="font-medium text-slate-800">{room.building || 'Gedung Utama'} (Lantai {room.floor || 1})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kapasitas Kursi:</span>
                    <span className="font-bold text-blue-600">{room.capacity} Peserta</span>
                  </div>
                  {room.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1">{room.notes}</p>
                  )}
                </div>

                {facilities.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {facilities.map((fac, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                  title="Ubah Ruangan"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  title="Hapus Ruangan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah/Ubah Ruang */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Informasi Ruangan' : 'Tambah Ruang Belajar Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kode Ruang</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="R-101 / LAB-KOMP-1"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tipe Ruang</label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="CLASSROOM">Kelas Teori</option>
                    <option value="LAB_COMPUTER">Lab Komputer & AI</option>
                    <option value="LAB_SCIENCE">Lab Sains Modern</option>
                    <option value="AUDITORIUM">Aula / Auditorium</option>
                    <option value="WORKSHOP">Bengkel / Workshop</option>
                    <option value="LIBRARY">Perpustakaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ruang Kelas Teori X-A"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nama Gedung</label>
                  <input
                    type="text"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    placeholder="Gedung Kihajar Dewantara"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Lantai</label>
                  <input
                    type="number"
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Kapasitas Maksimal (Siswa)</label>
                <input
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Fasilitas (Pisahkan Koma)</label>
                <input
                  type="text"
                  value={formFacilities}
                  onChange={(e) => setFormFacilities(e.target.value)}
                  placeholder="Smart Board, Proyektor, AC Split, Sound System"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Catatan Khusus</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Kondisi ruangan atau peruntukan khusus..."
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
