import { StorageBucketId, StorageUploadRecord } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface StorageValidationRule {
  maxSize: number; // Bytes
  allowedMimeTypes: string[];
}

export const STORAGE_BUCKET_RULES: Record<StorageBucketId, StorageValidationRule> = {
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  bus_passes: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  receipts: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  request_documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  route_documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  notices: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  },
};

export class StorageService {
  /**
   * Validate file against bucket size and MIME type restrictions.
   */
  static validateFile(file: File, bucketId: StorageBucketId): { valid: boolean; error?: string } {
    const rules = STORAGE_BUCKET_RULES[bucketId];
    if (!rules) return { valid: false, error: 'Invalid storage bucket target.' };

    if (file.size > rules.maxSize) {
      const maxMb = rules.maxSize / (1024 * 1024);
      return { valid: false, error: `File size exceeds max limit of ${maxMb}MB.` };
    }

    if (!rules.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: `Unsupported format (${file.type}). Allowed: ${rules.allowedMimeTypes.join(', ')}` };
    }

    return { valid: true };
  }

  /**
   * Generate collision-resistant unique storage filepath.
   * Format: bucket/ownerId/v1_timestamp_random.ext
   */
  static generateUniquePath(ownerId: string, fileName: string, version = 1): string {
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const cleanName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 8);
    return `${ownerId}/v${version}_${timestamp}_${randomHash}_${cleanName}.${fileExt}`;
  }

  /**
   * Upload file to Supabase Storage and log entry to file_upload_history.
   */
  static async uploadFile(
    file: File,
    bucketId: StorageBucketId,
    ownerId: string
  ): Promise<{ success: boolean; url?: string; record?: StorageUploadRecord; error?: string }> {
    const validation = this.validateFile(file, bucketId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const storagePath = this.generateUniquePath(ownerId, file.name);

    if (!isSupabaseConfigured) {
      const mockUrl = `https://storage.placeholder.com/${bucketId}/${storagePath}`;
      return {
        success: true,
        url: mockUrl,
        record: {
          id: `file_${Date.now()}`,
          bucketId,
          fileName: storagePath,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: ownerId,
          version: 1,
          storagePath,
          publicOrSignedUrl: mockUrl,
          createdAt: new Date().toISOString(),
        },
      };
    }

    try {
      // 1. Upload to Supabase Storage bucket
      const { error: uploadErr } = await supabase.storage
        .from(bucketId)
        .upload(storagePath, file, { upsert: true });

      if (uploadErr) return { success: false, error: uploadErr.message };

      // 2. Resolve Public URL or Signed URL based on bucket privacy
      let publicOrSignedUrl = '';
      if (bucketId === 'avatars' || bucketId === 'route_documents' || bucketId === 'notices') {
        const { data } = supabase.storage.from(bucketId).getPublicUrl(storagePath);
        publicOrSignedUrl = data.publicUrl;
      } else {
        // Protected bucket: Generate 1-hour signed access URL
        const { data, error: signErr } = await supabase.storage
          .from(bucketId)
          .createSignedUrl(storagePath, 3600);

        if (signErr || !data) return { success: false, error: 'Failed to generate signed URL access.' };
        publicOrSignedUrl = data.signedUrl;
      }

      // 3. Log file upload history in database
      await supabase.from('file_upload_history').insert({
        bucket_id: bucketId,
        file_name: storagePath,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        version: 1,
      });

      return {
        success: true,
        url: publicOrSignedUrl,
        record: {
          id: `file_${Date.now()}`,
          bucketId,
          fileName: storagePath,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: ownerId,
          version: 1,
          storagePath,
          publicOrSignedUrl,
          createdAt: new Date().toISOString(),
        },
      };
    } catch {
      return { success: false, error: 'Storage operation encountered a system error.' };
    }
  }

  /**
   * Generate temporary signed URL access (3600s) for protected files.
   */
  static async getSignedUrl(bucketId: StorageBucketId, path: string, expiresIn = 3600): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return `https://storage.placeholder.com/${bucketId}/${path}?signed=true`;
    }

    try {
      const { data, error } = await supabase.storage.from(bucketId).createSignedUrl(path, expiresIn);
      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  }
}
