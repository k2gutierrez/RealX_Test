const DEFAULT_IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const gatewayBase = () => {
  const configured = String(process.env.NEXT_PUBLIC_IPFS_GATEWAY || DEFAULT_IPFS_GATEWAY).trim();
  return `${configured.replace(/\/+$/, "")}/`;
};

const resolveMediaUrl = (reference = "") => {
  const value = String(reference).trim();
  if (!value.startsWith("ipfs://")) return value;
  return `${gatewayBase()}${value.slice(7).replace(/^ipfs\//, "")}`;
};

const validateImageReference = (reference = "") => {
  const value = String(reference).trim();
  if (!value) return "Property image is required.";
  if (value.startsWith("/") || value.startsWith("ipfs://")) return "";

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return "";
  } catch (_) {
    // Fall through to the user-facing validation message.
  }
  return "Use an http(s), ipfs://, or supplied local image reference.";
};

const validateImageFile = (file) => {
  if (!file) return "Choose an image before uploading.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Choose a JPEG, PNG, WebP, GIF, or AVIF image.";
  }
  if (!Number.isFinite(file.size) || file.size <= 0) return "The selected image is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 5 MB or smaller.";
  return "";
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error("The selected image could not be read."));
  reader.readAsDataURL(file);
});

const uploadPropertyImage = async (file) => {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const dataUrl = await fileToDataUrl(file);
  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, dataUrl }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "IPFS upload failed.");
  return payload;
};

const buildPropertyMetadata = (form = {}) => ({
  name: String(form.propertyTitle || "").trim(),
  description: String(form.description || "").trim(),
  image: String(form.images || "").trim(),
  external_url: "",
  attributes: [
    { trait_type: "Category", value: String(form.category || "").trim() },
    { trait_type: "Address", value: String(form.propertyAddress || "").trim() },
    { trait_type: "Price currency", value: "POL" },
  ],
});

module.exports = {
  ALLOWED_IMAGE_TYPES,
  DEFAULT_IPFS_GATEWAY,
  MAX_IMAGE_BYTES,
  buildPropertyMetadata,
  resolveMediaUrl,
  uploadPropertyImage,
  validateImageFile,
  validateImageReference,
};
