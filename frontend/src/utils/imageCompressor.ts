/**
 * Client-side Image Compression Utility
 * Resizes and compresses images using HTML5 Canvas before sending or saving to Firestore,
 * ensuring document sizes stay well below Firestore's 1MB limit (typically ~20-60KB).
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export const compressImage = (
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> => {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.75,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = document.createElement('img');
      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Fill background with white in case of transparent png converted to jpeg
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export compressed data URL
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Invalid image reader result'));
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Specifically tuned for avatars: 256x256 max, ~25KB max
 */
export const compressAvatar = (file: File | Blob): Promise<string> => {
  return compressImage(file, {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.8,
    mimeType: 'image/jpeg'
  });
};
