import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../../../services/media";

const DATA_URL_PATTERN = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/;

const safeName = (name = "property-image") => String(name)
  .replace(/[^a-zA-Z0-9._-]/g, "-")
  .replace(/-+/g, "-")
  .slice(0, 120) || "property-image";

const upload = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const jwt = String(process.env.PINATA_JWT || "").trim();
  if (!jwt) {
    return response.status(503).json({
      error: "IPFS upload is not configured. Add PINATA_JWT on the server or paste an image URL instead.",
    });
  }

  const match = String(request.body?.dataUrl || "").match(DATA_URL_PATTERN);
  const claimedType = String(request.body?.type || "").toLowerCase();
  const detectedType = String(match?.[1] || "").toLowerCase();
  if (!match || claimedType !== detectedType || !ALLOWED_IMAGE_TYPES.includes(detectedType)) {
    return response.status(400).json({ error: "A supported image file is required." });
  }

  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    return response.status(400).json({ error: "The image must be between 1 byte and 5 MB." });
  }

  const filename = safeName(request.body?.name);
  const form = new FormData();
  form.append("network", "public");
  form.append("name", filename);
  form.append("keyvalues", JSON.stringify({ application: "unlock-estate", assetType: "property-image" }));
  form.append("file", new Blob([bytes], { type: detectedType }), filename);

  try {
    const pinataResponse = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });
    const payload = await pinataResponse.json().catch(() => ({}));
    const cid = payload?.data?.cid;
    if (!pinataResponse.ok || !cid) {
      const message = payload?.error?.message || payload?.error || "Pinata rejected the upload.";
      return response.status(502).json({ error: String(message) });
    }

    return response.status(200).json({
      cid,
      ipfsUri: `ipfs://${cid}`,
      name: payload.data.name || filename,
      size: payload.data.size || bytes.length,
    });
  } catch (_) {
    return response.status(502).json({ error: "Pinata could not be reached. Try again or use an image URL." });
  }
};

export const config = {
  api: { bodyParser: { sizeLimit: "7mb" } },
};

export default upload;
