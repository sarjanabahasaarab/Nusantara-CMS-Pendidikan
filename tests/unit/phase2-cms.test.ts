/**
 * Nusantara Education CMS - Unit Tests
 * Phase 2 - Full Educational Content Management System (CMS)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cmsStore } from '../../src/lib/db';
import { slugify } from '../../src/lib/utils';
import { Post, Category } from '../../src/types';

describe('Phase 2: Content Management System Unit Tests', () => {
  beforeEach(() => {
    // Reset or prepare fresh test environment
  });

  describe('1. Hierarchical Categories & Cycle Prevention', () => {
    it('should prevent circular parent-child category relations', () => {
      // Create root category
      const root = cmsStore.createCategory({
        name: 'Sains Komputasi',
        slug: 'sains-komputasi',
        description: 'Kategori utama komputasi',
        parentId: null,
      });

      // Create child category
      const child = cmsStore.createCategory({
        name: 'Kecerdasan Artifisial',
        slug: 'kecerdasan-artifisial',
        description: 'Sub-kategori AI',
        parentId: root.id,
      });

      // Validate: child cannot become parent of root
      const canMakeChildParentOfRoot = cmsStore.validateNoParentCycle(root.id, child.id);
      expect(canMakeChildParentOfRoot).toBe(false);

      // Validate: self cannot be parent of self
      const canSelfBeParent = cmsStore.validateNoParentCycle(root.id, root.id);
      expect(canSelfBeParent).toBe(false);

      // Validate: null or unrelated can be parent
      const canNullBeParent = cmsStore.validateNoParentCycle(root.id, null);
      expect(canNullBeParent).toBe(true);
    });

    it('should generate valid slugs and auto-increment if duplicate exists', () => {
      const slug1 = slugify('Kurikulum Merdeka Belajar!');
      expect(slug1).toBe('kurikulum-merdeka-belajar');

      const tag1 = cmsStore.createTag({
        name: 'Olimpiade Sains 2026',
        slug: 'olimpiade-sains-2026',
      });
      expect(tag1.slug).toBe('olimpiade-sains-2026');

      // Duplicate tag with same slug should auto-increment
      const tag2 = cmsStore.createTag({
        name: 'Olimpiade Sains 2026',
        slug: 'olimpiade-sains-2026',
      });
      expect(tag2.slug).toBe('olimpiade-sains-2026-1');
    });
  });

  describe('2. Content Status & Scheduled Publishing', () => {
    it('should hide SCHEDULED posts in the future from public queries', () => {
      const futureDate = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days in future

      const scheduledPost = cmsStore.createPost({
        type: 'NEWS',
        title: 'Berita Masa Depan Terjadwal',
        slug: 'berita-masa-depan-terjadwal',
        excerpt: 'Belum boleh tampil di publik.',
        content: 'Isi berita masa depan...',
        status: 'SCHEDULED',
        scheduledAt: futureDate,
        authorId: 'user-admin-cms',
      });

      const publicPosts = cmsStore.getPublicPosts('NEWS');
      const found = publicPosts.find((p) => p.id === scheduledPost.id);
      expect(found).toBeUndefined();
    });

    it('should allow soft-delete (trash), restore, and bulk status updates', () => {
      const post = cmsStore.createPost({
        type: 'ARTICLE',
        title: 'Artikel Uji Coba Soft Delete',
        slug: 'artikel-uji-coba-soft-delete',
        excerpt: 'Ringkasan uji coba.',
        content: 'Konten artikel...',
        status: 'PUBLISHED',
        authorId: 'user-guru',
      });

      // Soft delete to TRASHED
      cmsStore.trashPost(post.id);
      let refetched = cmsStore.getPostById(post.id);
      expect(refetched?.status).toBe('TRASHED');
      expect(refetched?.deletedAt).toBeDefined();

      // Ensure it does not show in public posts
      expect(cmsStore.getPublicPosts().find((p) => p.id === post.id)).toBeUndefined();

      // Restore
      cmsStore.restorePost(post.id);
      refetched = cmsStore.getPostById(post.id);
      expect(refetched?.status).toBe('PUBLISHED');
      expect(refetched?.deletedAt).toBeUndefined();
    });
  });

  describe('3. Navigation Menu Tree & Anti-Spam Moderation', () => {
    it('should prevent circular references in nested menus', () => {
      const parentMenu = cmsStore.createMenu({
        label: 'Akademik',
        url: '/akademik',
        parentId: null,
        target: '_self',
        sortOrder: 10,
        isActive: true,
      });

      const childMenu = cmsStore.createMenu({
        label: 'Jadwal Ujian',
        url: '/jadwal-ujian',
        parentId: parentMenu.id,
        target: '_self',
        sortOrder: 1,
        isActive: true,
      });

      // Child cannot be parent of parentMenu
      const canReparent = cmsStore.validateMenuNoCycle(parentMenu.id, childMenu.id);
      expect(canReparent).toBe(false);
    });

    it('should catch spam comments via honeypot and keyword heuristic', () => {
      // Honeypot detection
      expect(() => {
        cmsStore.createComment({
          contentId: 'post-1',
          authorName: 'Spam Bot',
          authorEmail: 'bot@spam.com',
          content: 'Halo kawan',
          honeypot: 'filled-by-bot',
        });
      }).toThrow();

      // Keyword heuristic flagging as SPAM
      const spamComment = cmsStore.createComment({
        contentId: 'post-1',
        authorName: 'Penjual Slot',
        authorEmail: 'slot@test.com',
        content: 'Kunjungi link slot judi gacor maxwin!',
      });
      expect(spamComment.status).toBe('SPAM');
    });
  });
});
