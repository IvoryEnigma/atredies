import { supabase } from '../services/supabase';

/**
 * Upload a file Blob/File to Supabase Storage in the 'resources' bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(path: string, file: File | Blob): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage.from('resources').upload(path, file, {
      upsert: false,
      contentType: (file as File).type || 'application/octet-stream',
    });
    if (error) {
      console.warn('Supabase upload error:', error);
      return null;
    }
    // Get public URL
    const { data: urlData } = supabase.storage.from('resources').getPublicUrl(data?.path || path);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.warn('Exception during Supabase upload:', err);
    return null;
  }
}

/**
 * Delete a file from the 'resources' bucket.
 */
export async function deleteFile(path: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.storage.from('resources').remove([path]);
    if (error) {
      console.warn('Supabase delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception during Supabase delete:', err);
    return false;
  }
}
