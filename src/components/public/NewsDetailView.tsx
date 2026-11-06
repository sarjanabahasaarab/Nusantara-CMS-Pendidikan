import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  Globe,
  Tag as TagIcon,
  Eye,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Post, SiteSetting, ActiveNav, Comment } from '../../types';
import { formatDate, estimateReadingTime } from '../../lib/utils';
import { getPostMeta } from '../../lib/seo';
import { cmsStore } from '../../lib/db';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface NewsDetailViewProps {
  post: Post;
  allPosts: Post[];
  settings: SiteSetting;
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const NewsDetailView: React.FC<NewsDetailViewProps> = ({
  post,
  allPosts,
  settings,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const readingTime = estimateReadingTime(post.content);
  const meta = getPostMeta(post, settings);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Increment view count on mount
  useEffect(() => {
    cmsStore.incrementViewCount(post.slug);
    setComments(cmsStore.getCommentsByContent(post.id, true));
  }, [post.slug, post.id]);

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.status === 'PUBLISHED')
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    try {
      cmsStore.createComment({
        contentId: post.id,
        contentTitle: post.title,
        contentType: post.type,
        authorName,
        authorEmail,
        content: commentContent,
        honeypot,
      });

      setCommentSuccess(true);
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
      setComments(cmsStore.getCommentsByContent(post.id, true));

      setTimeout(() => {
        setCommentSuccess(false);
      }, 5000);
    } catch (err: any) {
      setCommentError(err.message || 'Gagal mengirim komentar.');
    }
  };

  return (
    <article className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(post.type === 'NEWS' ? 'news' : 'articles')}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{post.type === 'NEWS' ? 'Kembali ke Berita' : 'Kembali ke Artikel'}</span>
        </Button>

        <Badge variant="blue">{post.categoryName || 'Warta Pendidikan'}</Badge>
      </div>

      {/* Header Artikel */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <User className="w-4 h-4 text-blue-600" />
              {post.authorName || 'Redaksi Sekolah'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt || post.createdAt, 'full')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readingTime} menit baca
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Eye className="w-4 h-4 text-blue-600" />
              {(post.views || 0).toLocaleString('id-ID')} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs gap-1.5 h-8"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Hero Image */}
      {post.featuredImage && (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-[320px] sm:h-[450px] object-cover"
          />
        </div>
      )}

      {/* Konten Narasi */}
      <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 space-y-4">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Tags Chips Section */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Topik Terkait:</span>
            </span>
            {post.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KOMENTAR PUBLIK & FORM SUBMISSION */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Komentar & Diskusi ({comments.length})</span>
          </h3>
        </div>

        {/* Existing Approved Comments */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              Belum ada komentar untuk konten ini. Jadilah yang pertama memberikan tanggapan!
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {c.authorName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Submission Form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tinggalkan Komentar
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Alamat email Anda tidak akan dipublikasikan. Komentar akan ditinjau oleh tim moderasi sebelum tampil.
              </p>
            </div>

            {commentSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  Terima kasih! Komentar Anda telah berhasil dikirim dan akan tampil setelah disetujui moderator.
                </span>
              </div>
            )}

            {commentError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <form onSubmit={handleCommentSubmit} className="space-y-3">
              {/* Anti-spam honeypot (hidden from humans) */}
              <input
                type="text"
                name="website_url_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com..."
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Isi Komentar / Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan komentar atau pertanyaan yang santun..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm" className="gap-2 font-bold text-xs">
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Komentar</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Berita Terkait */}
      {relatedPosts.length > 0 && (
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Warta & Artikel Terkait
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Card
                key={related.id}
                className="cursor-pointer group flex flex-col justify-between hover:shadow-md transition-shadow"
                onClick={() => onNavigate('news-detail', related.slug)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={related.featuredImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400'}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    {related.categoryName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {related.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{related.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
