import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import app from './firebase';
import { compressImage } from '../utils/imageCompressor';

export const storage = getStorage(app);

/**
 * Upload image file to Firebase Storage under a designated path (e.g. accounts/, avatars/, rewards/)
 * Automatically falls back to compressed Base64 if storage is not provisioned or offline.
 */
export async function uploadImageToStorage(
  file: File | Blob,
  folderPath: string = 'accounts',
  customFileName?: string
): Promise<{ url: string; isCloudStorage: boolean }> {
  const fileName = customFileName || `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const storagePath = `${folderPath}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    // Upload the file
    const uploadTask = await uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: 'public,max-age=31536000'
    });

    const downloadUrl = await getDownloadURL(uploadTask.ref);
    return { url: downloadUrl, isCloudStorage: true };
  } catch (storageError) {
    console.warn('Firebase Storage upload notice, using optimized client fallback:', storageError);

    // Fallback: compress to optimized base64
    if (file instanceof File || file instanceof Blob) {
      try {
        const base64 = await compressImage(file as File, {
          maxWidth: 1024,
          maxHeight: 768,
          quality: 0.75,
          mimeType: 'image/jpeg'
        });
        return { url: base64, isCloudStorage: false };
      } catch (compressErr) {
        console.error('Failed to compress fallback image:', compressErr);
      }
    }

    // Default fallback placeholder
    return {
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      isCloudStorage: false
    };
  }
}
