'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Deletes a single file from Cloudinary
 * @param publicId - The Cloudinary public_id of the file
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result; // optional: return deletion info
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Deletes multiple files from Cloudinary
 * @param publicIds - Array of Cloudinary public_ids
 */
export async function deleteMultipleFromCloudinary(publicIds: string[]) {
  await Promise.all(publicIds.map((id) => deleteFromCloudinary(id)));
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Upload a raw Buffer (e.g. a generated PDF) to Cloudinary.
// Returns a permanent public HTTPS URL — required by Meta WhatsApp API.
//
// resource_type "raw" is mandatory for PDFs. Cloudinary won't serve a
// raw file with a .pdf extension unless you also set format explicitly,
// so we pass `format: "pdf"` to force the correct Content-Type header.
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string,
  folder = "receipts"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    // Strip extension — Cloudinary appends it via `format`
    const publicId = `${folder}/${filename.replace(/\.[^/.]+$/, "")}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",   // required for non-image/video files
        format: "pdf",          // ensures Content-Type: application/pdf on delivery
        folder,
        public_id: publicId,
        overwrite: true,        // idempotent: same receipt re-upload replaces the old one
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(`Cloudinary upload failed: ${error?.message ?? "no result"}`));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
}