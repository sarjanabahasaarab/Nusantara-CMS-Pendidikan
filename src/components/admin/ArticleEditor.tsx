import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  Lock,
  Unlock,
  Eye,
  Globe,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  Code,
  Link2,
  Clock,
  Sparkles,
  Tag as TagIcon,
  CheckCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import {
  Post,
  Category,
  ActiveNav,
  Media,
  ContentType,
  PostStatus,
  RobotsDirective,
  Tag,
} from '../../types';
import { slugify, formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface ArticleEditorProps {
  postId?: string;
  defaultType?: ContentType;
  categories: Category[];
  mediaList: Media[];
  onNavigate: (nav: ActiveNav, slugOrId?: string) => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  postId,
  defaultType = 'ARTICLE',
  categories,
  mediaList,
  onNavigate,
}) => {
  const { user } = useAuth();
  const isEditing = !!postId;

  // Basic Information
  const [contentType, setContentType] = useState<ContentType>(defaultType);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAuto, setSlugAuto] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Status & Publishing
  const [status, setStatus] = useState<PostStatus>('PUBLISHED');
  const [scheduledAt, setScheduledAt] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // SEO per Konten
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [robots, setRobots] = useState<RobotsDirective>('INDEX, FOLLOW');
  const [allowIndex, setAllowIndex] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);

  // Modals & UI States
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [internalLinkModalOpen, setInternalLinkModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableTags = cmsStore.getTags();
  const canPublish = hasPermission(user, 'posts.publish');

  // Load existing article if editing
  useEffect(() => {
    if (postId) {
      const existing = cmsStore.getPostById(postId);
      if (existing) {
        setContentType(existing.type);
        setTitle(existing.title);
        setSlug(existing.slug);
        setSlugAuto(false);
        setCategoryId(existing.categoryId || (categories[0]?.id ?? ''));
        setExcerpt(existing.excerpt);
        setContent(existing.content);
        setFeaturedImage(existing.featuredImage || '');
        setIsFeatured(!!existing.isFeatured);
        setStatus(existing.status);
        setScheduledAt(existing.scheduledAt ? existing.scheduledAt.slice(0, 16) : '');
        setTags(existing.tags || []);
        setMetaTitle(existing.metaTitle || '');
        setMetaDescription(existing.metaDescription || '');
        setCanonicalUrl(existing.canonicalUrl || '');
        setOgImage(existing.ogImage || '');
        setRobots(existing.robots || 'INDEX, FOLLOW');
        setAllowIndex(existing.allowIndex ?? true);
        setAllowFollow(existing.allowFollow ?? true);
      }
    } else {
      setContentType(defaultType);
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }
  }, [postId, categories, defaultType]);

  // Title change with auto slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (slugAuto) {
      const auto = slugify(val);
      setSlug(auto);
      if (!metaTitle) setMetaTitle(val);
    }
  };

  // Excerpt change with auto metaDescription
  const handleExcerptChange = (val: string) => {
    setExcerpt(val);
    if (!metaDescription) setMetaDescription(val);
  };

  // Toolbar formatting insertion
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('article-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Insert internal link
  const handleInsertInternalLink = (url: string, linkText: string) => {
    const markdown = `[${linkText}](${url})`;
    insertFormatting(markdown);
    setInternalLinkModalOpen(false);
  };

  // Tag management
  const handleAddTag = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (name: string) => {
    setTags(tags.filter((t) => t !== name));
  };

  // Save handler
  const handleSave = async (targetStatus?: PostStatus) => {
    if (!title.trim()) {
      alert('Judul konten tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    const chosenStatus = targetStatus || status;

    const selectedCat = categories.find((c) => c.id === categoryId);

    const postPayload = {
      type: contentType,
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim(),
      content: content.trim(),
      featuredImage: featuredImage.trim() || undefined,
      isFeatured,
      status: chosenStatus,
      authorId: user?.id || 'system',
      authorName: user?.name || 'Administrator',
      categoryId: categoryId || undefined,
      categoryName: selectedCat?.name,
      tags,
      scheduledAt:
        chosenStatus === 'SCHEDULED' && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim(),
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogImage: ogImage.trim() || featuredImage.trim() || undefined,
      robots,
      allowIndex,
      allowFollow,
    };

    try {
      if (isEditing && postId) {
        cmsStore.updatePost(postId, postPayload, user);
      } else {
        cmsStore.createPost(postPayload, user);
      }

      setToastMessage('Konten berhasil disimpan!');
      setTimeout(() => {
        onNavigate(contentType === 'NEWS' ? 'admin-news' : 'admin-posts');
      }, 700);
    } catch (e: any) {
      alert('Gagal menyimpan konten: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(contentType === 'NEWS' ? 'admin-news' : 'admin-posts')}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? 'Sunting Konten' : 'Tulis Konten Baru'}
              </h1>
              <Badge variant={contentType === 'NEWS' ? 'green' : 'blue'}>
                {contentType === 'NEWS' ? 'Warta Berita' : 'Artikel'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola teks narasi, taksonomi, berkas gambar unggulan, dan optimasi SEO terpadu.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewModalOpen(true)}
            className="gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Pratinjau</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave('DRAFT')}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Draf</span>
          </Button>

          {canPublish && (
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave(scheduledAt ? 'SCHEDULED' : 'PUBLISHED')}
              className="gap-1.5 font-bold"
            >
              <Send className="w-4 h-4" />
              <span>{scheduledAt ? 'Jadwalkan Tayang' : 'Terbitkan Sekarang'}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Form Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Type Switcher */}
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tipe Konten:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType('ARTICLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      contentType === 'ARTICLE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Artikel Edukasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('NEWS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      contentType === 'NEWS'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Warta Berita Sekolah
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Judul Konten <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul artikel atau berita lengkap..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-base sm:text-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Slug URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlugAuto(!slugAuto)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {slugAuto ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{slugAuto ? 'Otomatis dari Judul' : 'Kustom Manual'}</span>
                  </button>
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-400 shrink-0 font-mono">
                    /{contentType === 'NEWS' ? 'berita' : 'artikel'}/
                  </span>
                  <input
                    type="text"
                    disabled={slugAuto}
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full bg-transparent border-none text-slate-800 dark:text-slate-200 font-mono focus:outline-none pl-1 disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Excerpt Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ringkasan / Abstrak Singkat <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu beranda dan cuplikan media sosial..."
                  value={excerpt}
                  onChange={(e) => handleExcerptChange(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content Body Editor with Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Isi Konten Lengkap
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        activeTab === 'write' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        activeTab === 'preview' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Pratinjau Langsung
                    </button>
                  </div>
                </div>

                {activeTab === 'write' ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    {/* Toolbar */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        title="Tebal (Bold)"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        title="Miring (Italic)"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n## ', '\n')}
                        title="Sub-judul (H2)"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n> ', '\n')}
                        title="Kutipan (Quote)"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n- ', '\n')}
                        title="Daftar Poin (List)"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('`', '`')}
                        title="Kode Segaris"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                      <button
                        type="button"
                        onClick={() => setInternalLinkModalOpen(true)}
                        title="Sisipkan Tautan Internal / Eksternal"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Tautan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        title="Sisipkan Gambar dari Pustaka Media"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Sisip Gambar</span>
                      </button>
                    </div>

                    <textarea
                      id="article-content-area"
                      rows={14}
                      placeholder="Tuliskan isi warta atau materi edukasi secara mendalam..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 border-none focus:outline-none resize-y"
                    />

                    {/* Word & Character Counter */}
                    <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>
                        {content.trim() ? content.trim().split(/\s+/).length : 0} kata | {content.length} karakter
                      </span>
                      <span>Format: Markdown & Teks Bebas</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 min-h-[350px] bg-white dark:bg-slate-950 prose dark:prose-invert max-w-none text-xs">
                    {content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO & Metatag Engine */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Optimasi Mesin Pencari (SEO Per Konten)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google SERP Preview Card */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Cuplikan Hasil Pencarian Google (SERP Preview)
                </span>
                <div className="font-sans">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    https://sman-nusantara.sch.id › {contentType === 'NEWS' ? 'berita' : 'artikel'} › {slug || 'judul-konten'}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                    {metaTitle || title || 'Judul Konten Pendidikan'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                    {metaDescription || excerpt || 'Deskripsi ringkasan materi atau berita yang akan tampil pada mesin pencari.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Judul SEO optimal 50-60 karakter..."
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    URL Kanonikal (Canonical)
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://sman-nusantara.sch.id/..."
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Deskripsi ringkas 140-160 karakter untuk Google dan media sosial..."
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Robots Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Direktif Robots Mesin Pencari
                  </label>
                  <select
                    value={robots}
                    onChange={(e) => setRobots(e.target.value as RobotsDirective)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="INDEX, FOLLOW">INDEX, FOLLOW (Standar Direkomendasikan)</option>
                    <option value="NOINDEX, FOLLOW">NOINDEX, FOLLOW (Jangan Tampilkan di Hasil Cari)</option>
                    <option value="INDEX, NOFOLLOW">INDEX, NOFOLLOW (Indeks Tanpa Ikuti Tautan)</option>
                    <option value="NOINDEX, NOFOLLOW">NOINDEX, NOFOLLOW (Privat / Tertutup)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowIndex}
                      onChange={(e) => setAllowIndex(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Izinkan Pengindeksan (Allow Index)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowFollow}
                      onChange={(e) => setAllowFollow(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Izinkan Ikuti Tautan (Allow Follow)</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sidebar Controls & Taxonomies */}
        <div className="space-y-6">
          {/* Status & Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
                Status & Penjadwalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                >
                  <option value="PUBLISHED">Tayang (Published)</option>
                  <option value="SCHEDULED">Terjadwal (Scheduled)</option>
                  <option value="DRAFT">Draf Kerja (Draft)</option>
                  <option value="TRASHED">Tong Sampah (Trashed)</option>
                </select>
              </div>

              {/* Schedule Datetime Picker */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jadwal Tayang Otomatis</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    if (e.target.value) setStatus('SCHEDULED');
                  }}
                  className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                />
                <span className="text-[10px] text-slate-400 block">
                  Zona Waktu: Asia/Jakarta (WIB). Konten tidak akan tampil publik sebelum waktu ini tiba.
                </span>
              </div>

              {/* Featured toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Sorot sebagai Konten Utama (Featured)
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">
                    Tampil sebagai banner hero utama di beranda website publik.
                  </span>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Featured Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
                Gambar Utama (Featured Image)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={featuredImage}
                    alt=""
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      Ganti
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setFeaturedImage('')}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-slate-500"
                >
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold">Pilih Gambar dari Media</span>
                </button>
              )}

              <input
                type="text"
                placeholder="Atau tempel URL gambar eksternal..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
              />
            </CardContent>
          </Card>

          {/* Category Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
                Kategori Berjenjang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                aria-label="Pilih kategori"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentName ? `— ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
                Tag Konten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik tag lalu tekan Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTag(tagInput)}
                >
                  Tambah
                </Button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-blue-500 hover:text-blue-800 dark:hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested tags */}
              {availableTags.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Tag Populer:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.slice(0, 6).map((tg) => (
                      <button
                        key={tg.id}
                        type="button"
                        onClick={() => handleAddTag(tg.name)}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        +{tg.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <Modal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          title="Pilih Berkas dari Pustaka Media"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {mediaList
                .filter((m) => m.mimeType.startsWith('image/'))
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setFeaturedImage(m.fileUrl);
                      setMediaPickerOpen(false);
                    }}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 group relative"
                  >
                    <img
                      src={m.fileUrl}
                      alt={m.altText || m.fileName}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1.5 bg-white dark:bg-slate-900 text-[10px] truncate text-slate-600 dark:text-slate-400">
                      {m.fileName}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Internal Link Picker Modal */}
      {internalLinkModalOpen && (
        <Modal
          isOpen={internalLinkModalOpen}
          onClose={() => setInternalLinkModalOpen(false)}
          title="Sisipkan Tautan Internal"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pilih halaman atau masukkan tautan yang ingin disematkan ke dalam naskah:
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto text-xs">
              <div
                onClick={() => handleInsertInternalLink('/tentang', 'Tentang Sekolah Kami')}
                className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg"
              >
                <div className="font-bold">Tentang Sekolah Kami</div>
                <div className="text-[10px] text-slate-400">/tentang</div>
              </div>
              <div
                onClick={() => handleInsertInternalLink('/kontak', 'Layanan PPDB & Kontak')}
                className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg"
              >
                <div className="font-bold">Layanan PPDB & Kontak</div>
                <div className="text-[10px] text-slate-400">/kontak</div>
              </div>
              <div
                onClick={() => handleInsertInternalLink('/berita', 'Portal Warta Berita')}
                className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg"
              >
                <div className="font-bold">Portal Warta Berita</div>
                <div className="text-[10px] text-slate-400">/berita</div>
              </div>
              <div
                onClick={() => handleInsertInternalLink('/agenda', 'Kalender Agenda')}
                className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg"
              >
                <div className="font-bold">Kalender Agenda Sekolah</div>
                <div className="text-[10px] text-slate-400">/agenda</div>
              </div>
              <div
                onClick={() => handleInsertInternalLink('/galeri', 'Galeri Dokumentasi')}
                className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg"
              >
                <div className="font-bold">Galeri Dokumentasi Foto</div>
                <div className="text-[10px] text-slate-400">/galeri</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Read-Only Full Preview Modal (Phase 2 Requirement) */}
      {previewModalOpen && (
        <Modal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title="Pratinjau Konten (Preview Mode)"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Unindexed Notice Header */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Eye className="w-4 h-4 shrink-0" />
              <span>
                <strong>Mode Pratinjau Terbuka:</strong> Halaman ini bersifat read-only dan belum terindeks oleh mesin pencari.
              </span>
            </div>

            <div className="space-y-3">
              <Badge variant="blue">{categories.find((c) => c.id === categoryId)?.name || 'Edukasi'}</Badge>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {title || 'Judul Konten Pratinjau'}
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Penulis: {user?.name || 'Administrator'}</span>
                <span>Status: {status}</span>
              </div>
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt=""
                  className="w-full h-56 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
              )}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl italic text-xs text-slate-600 dark:text-slate-300 border-l-4 border-blue-600">
                {excerpt || 'Abstrak ringkasan isi warta atau materi edukasi.'}
              </div>
              <div className="prose dark:prose-invert text-xs space-y-3 pt-2">
                {content.split('\n\n').map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
