/**
 * Nusantara Education CMS - SEO & Metadata Generator
 * Mendukung Dynamic Meta, OpenGraph, Twitter Card, Sitemap.xml, dan Robots.txt
 */

import { Post, Page, SiteSetting } from '../../types';

export interface MetaConfig {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  author?: string;
}

/**
 * Generate metadata terstruktur untuk HTML head
 */
export function generateMetaTags(config: MetaConfig, settings: SiteSetting) {
  const fullTitle = `${config.title} | ${settings.siteName}`;
  const fullDesc = config.description || settings.description;
  const image = config.ogImage || settings.logo || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200';

  return {
    title: fullTitle,
    description: fullDesc,
    canonical: config.canonical || 'https://nusantara-education.sch.id',
    openGraph: {
      title: fullTitle,
      description: fullDesc,
      type: config.ogType || 'website',
      image,
      siteName: settings.siteName,
      publishedTime: config.publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDesc,
      image,
    },
  };
}

/**
 * Helper metadata khusus artikel/berita
 */
export function getPostMeta(post: Post, settings: SiteSetting): MetaConfig {
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    ogType: 'article',
    ogImage: post.featuredImage,
    publishedTime: post.publishedAt,
    author: post.authorName,
    canonical: `https://nusantara-education.sch.id/berita/${post.slug}`,
  };
}

/**
 * Helper metadata khusus halaman statis
 */
export function getPageMeta(page: Page, settings: SiteSetting): MetaConfig {
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt,
    ogType: 'website',
    canonical: `https://nusantara-education.sch.id/${page.slug}`,
  };
}

/**
 * Generator XML Sitemap lengkap berbasis data riil CMS
 */
export function generateSitemapXml(
  baseUrl: string,
  posts: Post[],
  pages: Page[]
): string {
  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/tentang`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/berita`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/pengumuman`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/agenda`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/kontak`, priority: '0.7', changefreq: 'monthly' },
  ];

  const postUrls = posts
    .filter((p) => p.status === 'PUBLISHED')
    .map((p) => ({
      loc: `${baseUrl}/berita/${p.slug}`,
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      priority: '0.8',
      changefreq: 'weekly',
    }));

  const pageUrls = pages
    .filter((pg) => pg.status === 'PUBLISHED')
    .map((pg) => ({
      loc: `${baseUrl}/${pg.slug}`,
      lastmod: pg.updatedAt ? new Date(pg.updatedAt).toISOString() : new Date().toISOString(),
      priority: '0.7',
      changefreq: 'monthly',
    }));

  const allUrls = [...staticUrls, ...postUrls, ...pageUrls];

  const urlsXml = allUrls
    .map(
      (item) => `  <url>
    <loc>${item.loc}</loc>
    ${'lastmod' in item ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

/**
 * Generator isi file robots.txt
 */
export function generateRobotsTxt(baseUrl: string): string {
  return `# Nusantara Education CMS - robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login

Sitemap: ${baseUrl}/sitemap.xml
`;
}
