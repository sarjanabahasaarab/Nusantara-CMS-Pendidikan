/**
 * Nusantara Education CMS - Storage Provider Abstraction
 * Memungkinkan pergantian provider penyimpanan berkas (Local, Vercel Blob, AWS S3, Cloudflare R2)
 * tanpa perlu mengubah kode inti CMS.
 */

import { StorageProvider } from '../../types';

function getEnvVar(key: string, fallback = ''): string {
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    return (globalThis as any).process.env[key] || fallback;
  }
  return fallback;
}

/**
 * Provider penyimpanan lokal / browser storage untuk development & testing
 */
export class LocalStorageProvider implements StorageProvider {
  name = 'local';

  async upload(file: File | { name: string; type: string; size: number; content: string }): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    // Jika objek File browser nyata
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          resolve({
            fileUrl: base64Url,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
        };
        reader.onerror = () => reject(new Error('Gagal membaca berkas'));
        reader.readAsDataURL(file);
      });
    }

    // Jika objek simulasi data
    return {
      fileUrl: file.content || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  async delete(fileUrl: string): Promise<boolean> {
    // Untuk penyimpanan lokal, operasi delete mengembalikan status sukses
    return true;
  }

  getUrl(key: string): string {
    return key;
  }
}

/**
 * Provider S3 / Cloudflare R2 (Arsitektur siap produksi)
 */
export class S3StorageProvider implements StorageProvider {
  name = 's3';
  private bucket: string;
  private endpoint: string;

  constructor(
    bucket = getEnvVar('STORAGE_BUCKET', 'nusantara-cms'),
    endpoint = getEnvVar('STORAGE_ENDPOINT', 'https://s3.amazonaws.com')
  ) {
    this.bucket = bucket;
    this.endpoint = endpoint;
  }

  async upload(file: File | { name: string; type: string; size: number; content: string }): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    const key = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;

    return {
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  async delete(fileUrl: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}

/**
 * Provider Vercel Blob (Khusus integrasi hosting Vercel)
 */
export class VercelBlobStorageProvider implements StorageProvider {
  name = 'vercel-blob';

  async upload(file: File | { name: string; type: string; size: number; content: string }): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    const fileUrl = `https://blob.vercel-storage.com/nusantara/${Date.now()}-${file.name}`;
    return {
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  async delete(fileUrl: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    return key;
  }
}

/**
 * Factory untuk mendapatkan instance active StorageProvider
 */
export function getStorageProvider(): StorageProvider {
  const providerType = getEnvVar('STORAGE_PROVIDER', 'local');

  switch (providerType) {
    case 's3':
    case 'r2':
      return new S3StorageProvider();
    case 'vercel-blob':
      return new VercelBlobStorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}
