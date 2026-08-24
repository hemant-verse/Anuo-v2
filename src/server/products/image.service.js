import { deleteFromImageKit, uploadToImageKit } from '@/lib/imagekit';

export const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function hasSupportedSignature(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true;
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return true;
  return false;
}

export async function validateProductImage(file) {
  if (!file || typeof file === 'string') {
    const error = new Error('Image file is required');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    const error = new Error('Only JPG, PNG, and WEBP images are allowed');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    const error = new Error('Image must be 10MB or smaller');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasSupportedSignature(buffer)) {
    const error = new Error('Uploaded file is not a supported image');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }
  return buffer;
}

export async function uploadProductImage(file) {
  const buffer = await validateProductImage(file);
  const fileName = `${Date.now()}_${file.name || 'product.webp'}`;
  return uploadToImageKit(buffer, fileName, 'campusmarket/products');
}

export async function cleanupProductImage(fileId) {
  if (!fileId) return;
  try {
    await deleteFromImageKit(fileId);
  } catch {
    // Cleanup is best-effort; the database transaction has already failed.
  }
}
