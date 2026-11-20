// Provider KYC files (ID proof, selfie, business registration) are private (ADR-0006).
// They are uploaded to Cloudinary as `authenticated` assets, which have no public URL. The Provider
// document stores a reference "cld-auth/<format>/<public_id>"; admins get a short-lived signed
// download link from GET /api/admin/providers/:id/documents.
// Legacy rows still hold public https URLs until scripts/migrations/003-private-kyc.mjs moves them.
import { v2 as cloudinary } from "cloudinary";

const PREFIX = "cld-auth/";

export const isPrivateKycRef = (ref) => typeof ref === "string" && ref.startsWith(PREFIX);

export const kycRef = (uploaded) => `${PREFIX}${uploaded.format}/${uploaded.public_id}`;

/** Upload a data URL or remote URL as a private (authenticated) image; returns the stored reference. */
export async function uploadPrivateKyc(source, folder) {
  const uploaded = await cloudinary.uploader.upload(source, { folder, type: "authenticated", resource_type: "image" });
  return kycRef(uploaded);
}

/** Signed link valid for ttlSeconds (admins only). Legacy public URLs are returned unchanged. */
export function kycViewUrl(ref, ttlSeconds = 300) {
  if (!ref) return "";
  if (!isPrivateKycRef(ref)) return ref;
  const [, format, ...rest] = ref.split("/");
  return cloudinary.utils.private_download_url(rest.join("/"), format, {
    type: "authenticated",
    resource_type: "image",
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}
