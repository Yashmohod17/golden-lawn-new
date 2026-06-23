import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface StorageProvider {
  uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string>;
  deleteImage(fileUrl: string, bucket: string): Promise<void>;
  getPublicUrl(filename: string, bucket: string): Promise<string>;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadsDir = path.join(__dirname, '../../uploads');

  async uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string> {
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
  private supabaseBucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    this.supabaseBucket = process.env.SUPABASE_BUCKET || 'golden-lawn-cms';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Warning: SUPABASE_URL or SUPABASE_KEY is missing in env config. Supabase uploads will fail.');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(fileBuffer: Buffer, filename: string, bucket: string, mimeType: string): Promise<string> {
    const storagePath = `${bucket}/${filename}`;
    const { data, error } = await this.supabase.storage
      .from(this.supabaseBucket)
      .upload(storagePath, fileBuffer, {
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
      const storagePath = `${bucket}/${filename}`;
      const { error } = await this.supabase.storage
        .from(this.supabaseBucket)
        .remove([storagePath]);

      if (error) {
        console.error(`Failed to delete image from Supabase: ${fileUrl}`, error);
      }
    } catch (error) {
      console.error(`Failed to delete image from Supabase: ${fileUrl}`, error);
    }
  }

  async getPublicUrl(filename: string, bucket: string): Promise<string> {
    const storagePath = `${bucket}/${filename}`;
    const { data } = this.supabase.storage
      .from(this.supabaseBucket)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }
}

const providerType = process.env.STORAGE_PROVIDER || 'local';
export const storageService = providerType === 'supabase'
  ? new SupabaseStorageProvider()
  : new LocalStorageProvider();
