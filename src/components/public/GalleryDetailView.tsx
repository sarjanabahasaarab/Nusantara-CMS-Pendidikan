import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { GalleryAlbum, GalleryPhoto, ActiveNav } from '../../types';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface GalleryDetailViewProps {
  album: GalleryAlbum;
  onNavigate: (nav: ActiveNav) => void;
}

export const GalleryDetailView: React.FC<GalleryDetailViewProps> = ({
  album,
  onNavigate,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const photos = album.photos || [];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && photos.length > 0) {
      setActivePhotoIndex((activePhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && photos.length > 0) {
      setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('gallery')}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Galeri</span>
        </Button>

        <span className="text-xs text-slate-400">
          {photos.length} Foto dalam Album Ini
        </span>
      </div>

      {/* Album Title Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="text-xs">
            Album Dokumentasi
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(album.createdAt)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {album.title}
        </h1>

        {album.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {album.description}
          </p>
        )}
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setActivePhotoIndex(index)}
            className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer hover:shadow-lg transition-all"
          >
            <img
              src={photo.imageUrl}
              alt={photo.caption || album.title}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              {photo.caption && (
                <p className="text-xs font-medium line-clamp-2">{photo.caption}</p>
              )}
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-300 mt-1">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Perbesar Foto</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Top Bar inside Lightbox */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-4">
            <span className="text-xs font-bold text-slate-400">
              Foto {activePhotoIndex + 1} dari {photos.length}
            </span>
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image & Navigation */}
          <div
            className="relative max-w-5xl max-h-[75vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[activePhotoIndex].imageUrl}
              alt=""
              className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {/* Prev Button */}
            {photos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:-left-12 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:-right-12 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Caption */}
          <div className="w-full max-w-3xl text-center pt-4">
            <p className="text-xs sm:text-sm text-slate-200">
              {photos[activePhotoIndex].caption || album.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
