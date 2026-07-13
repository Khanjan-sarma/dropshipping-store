import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from either CLOUDINARY_URL or the discrete vars.
// CLOUDINARY_URL, if set, is picked up automatically by the SDK.
let configured = false;

export function getCloudinary() {
  if (!configured) {
    if (!process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    } else {
      cloudinary.config({ secure: true });
    }
    configured = true;
  }
  return cloudinary;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET),
  );
}

/**
 * Upload a base64 data URI to Cloudinary and return the secure URL.
 */
export async function uploadImage(dataUri: string): Promise<string> {
  const cld = getCloudinary();
  const res = await cld.uploader.upload(dataUri, {
    folder: "dropshipping-store/products",
    resource_type: "image",
  });
  return res.secure_url;
}
