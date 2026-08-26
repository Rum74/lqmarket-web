import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload image to Supabase Storage bucket 'account-images'
 */
export async function uploadImageToSupabaseStorage(
  file: File,
  folder: string = 'accounts'
): Promise<string> {
  if (!isSupabaseConfigured) {
    // Return Object URL for temporary client preview if Supabase storage isn't connected yet
    return URL.createObjectURL(file);
  }

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${timestamp}_${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from('account-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    // If bucket doesn't exist, create fallback URL
    return URL.createObjectURL(file);
  }

  const { data: publicUrlData } = supabase.storage
    .from('account-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
