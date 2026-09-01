/**
 * Image compression utility to ensure uploaded images are optimized for fast web loading
 * and stay well under Firestore's 1MB document size limit.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
}

/**
 * Compresses an image File or Base64 string to a lightweight Data URL
 */
export async function compressImage(
  input: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    mimeType = "image/jpeg"
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        if (typeof input === "string") {
          resolve(input);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(input);
        }
        return;
      }

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(img.src);
        return;
      }

      // Draw white background for transparent PNGs converted to JPEG
      if (mimeType === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        // Fallback to original src if canvas export fails
        resolve(img.src);
      }
    };

    img.onload = processImage;
    img.onerror = () => {
      if (typeof input === "string") {
        resolve(input);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(input);
      }
    };

    if (typeof input === "string") {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("Falha ao ler arquivo"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(input);
    }
  });
}
