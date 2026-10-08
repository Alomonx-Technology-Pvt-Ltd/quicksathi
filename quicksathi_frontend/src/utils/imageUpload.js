import api, { clearCache } from "../config/api";

/**
 * Compresses an image File using an HTML5 Canvas to keep uploads fast,
 * high-quality, and well under payload limits (< 800 KB).
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.85) {
  if (!file) throw new Error("No file provided");

  // If not an image or SVG/GIF, return as dataURL directly
  if (
    !file.type ||
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result); // Fallback to raw dataURL if image load fails
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Cloudinary via backend /api/admin/upload
 * with automatic client-side compression and extended 60s timeout.
 */
export async function uploadImageFile(file, options = {}) {
  if (!file) throw new Error("No file provided");
  const base64Data = await compressImage(
    file,
    options.maxWidth || 1920,
    options.maxHeight || 1080,
    options.quality || 0.85
  );

  const { data } = await api.post(
    "/admin/upload",
    { image: base64Data },
    { timeout: 60000 }
  );

  // Invalidate in-memory caches so fresh images show everywhere immediately
  clearCache();

  return data.url;
}
