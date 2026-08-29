/**
 * Client-side Image Compression Utility
 * Resizes and compresses images using HTML5 Canvas before uploading,
 * ensuring high resolution while keeping file sizes lightweight (typically ~20-60KB).
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
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
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
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original reader string if canvas context not ready
          if (typeof readerEvent.target?.result === 'string') {
            resolve(readerEvent.target.result);
            return;
          }
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Fill background with clean dark neutral or white
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export compressed data URL
        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        } catch {
          if (typeof readerEvent.target?.result === 'string') {
            resolve(readerEvent.target.result);
          } else {
            reject(new Error('Failed to encode image data'));
          }
        }
      };

      img.onerror = () => {
        // If image object fails to decode directly, try raw data url as fallback
        if (typeof readerEvent.target?.result === 'string') {
          resolve(readerEvent.target.result);
        } else {
          reject(new Error('Failed to load image for compression'));
        }
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
 * Specifically tuned for avatars: 320x320 max
 */
export const compressAvatar = (file: File | Blob): Promise<string> => {
  return compressImage(file, {
    maxWidth: 320,
    maxHeight: 320,
    quality: 0.85,
    mimeType: 'image/jpeg'
  });
};
