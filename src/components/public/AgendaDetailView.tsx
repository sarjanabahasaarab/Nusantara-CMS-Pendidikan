import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Share2,
  CalendarPlus,
  CheckCircle,
} from 'lucide-react';
import { EventItem, ActiveNav } from '../../types';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface AgendaDetailViewProps {
  event: EventItem;
  onNavigate: (nav: ActiveNav) => void;
}

export const AgendaDetailView: React.FC<AgendaDetailViewProps> = ({
  event,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleCalendar = () => {
    const startTime = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = event.endDate
      ? new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : startTime;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
      event.location
    )}&dates=${startTime}/${endTime}`;

    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('agenda')}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kalender Agenda</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 text-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Tautan Tersalin!' : 'Bagikan Agenda'}</span>
        </Button>
      </div>

      {/* Main Event Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="blue">{event.category || 'Agenda Kampus'}</Badge>
          <span className="text-xs text-slate-400">
            Diterbitkan oleh {event.organizer || 'Sekolah'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {event.title}
        </h1>

        {/* Featured Image if any */}
        {event.featuredImage && (
          <img
            src={event.featuredImage}
            alt=""
            className="w-full h-72 sm:h-96 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
          />
        )}
      </div>

      {/* Event Details Grid Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tanggal Kegiatan
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatDate(event.startDate)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Waktu Pelaksanaan
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {event.allDay
                    ? 'Sepanjang Hari'
                    : new Date(event.startDate).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' WIB'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lokasi Tempat
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {event.location}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleGoogleCalendar}
              className="gap-2 font-bold text-xs"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Simpan ke Google Calendar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Description Content */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Rincian dan Petunjuk Kegiatan
        </h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {event.description}
        </div>
      </div>
    </div>
  );
};
