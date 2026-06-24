import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface StorageProvider {
  uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string>;
  deleteImage(fileUrl: string, bucket: string): Promise<void>;
  getPublicUrl(filename: string, bucket: string): Promise<string>;
}

function validateImage(fileBuffer: Buffer, mimeType: string) {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
    const error = new Error(`Invalid image type: ${mimeType}. Allowed types: JPEG, PNG, GIF, WEBP, SVG`);
    (error as any).status = 400;
    throw error;
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (fileBuffer.length > maxSizeBytes) {
    const error = new Error(`File size ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB exceeds the 5MB limit.`);
    (error as any).status = 400;
    throw error;
  }
}

export class LocalStorageProvider implements StorageProvider {
  private uploadsDir = path.join(__dirname, '../../uploads');

  async uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string> {
    validateImage(fileBuffer, mimeType);

    const bucketDir = path.join(this.uploadsDir, bucket);
    // Ensure the folder exists
    await fs.promises.mkdir(bucketDir, { recursive: true });
    
    const filePath = path.join(bucketDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);

    return this.getPublicUrl(filename, bucket);
  }

  async deleteImage(fileUrl: string, bucket: string): Promise<void> {
    try {
      const segments = fileUrl.split('/');
      const filename = segments[segments.length - 1];
      const filePath = path.join(this.uploadsDir, bucket, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete local image: ${fileUrl}`, error);
    }
  }

  async getPublicUrl(filename: string, bucket: string): Promise<string> {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/uploads/${bucket}/${filename}`;
  }
}

export class SupabaseStorageProvider implements StorageProvider {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY is missing in env config. Supabase uploads will fail.');
    }

    // Clean URL if it has the rest/v1/ suffix
    let cleanUrl = supabaseUrl;
    if (cleanUrl.endsWith('/rest/v1/')) {
      cleanUrl = cleanUrl.slice(0, -9);
    } else if (cleanUrl.endsWith('/rest/v1')) {
      cleanUrl = cleanUrl.slice(0, -8);
    }

    this.supabase = createClient(cleanUrl, supabaseKey);
  }

  async uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string> {
    validateImage(fileBuffer, mimeType);

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return this.getPublicUrl(filename, bucket);
  }

  async deleteImage(fileUrl: string, bucket: string): Promise<void> {
    try {
      const segments = fileUrl.split('/');
      const filename = segments[segments.length - 1];
      
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filename]);

      if (error) {
        console.error(`Failed to delete image from Supabase bucket ${bucket}: ${fileUrl}`, error);
      }
    } catch (error) {
      console.error(`Failed to delete image from Supabase bucket ${bucket}: ${fileUrl}`, error);
    }
  }

  async getPublicUrl(filename: string, bucket: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return data.publicUrl;
  }
}

const providerType = process.env.STORAGE_PROVIDER || 'local';
export const storageService = providerType === 'supabase'
  ? new SupabaseStorageProvider()
  : new LocalStorageProvider();

