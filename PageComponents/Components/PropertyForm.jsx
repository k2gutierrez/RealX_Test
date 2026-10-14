import { useEffect, useState } from "react";
import { CATEGORIES } from "../../data/properties";
import { resolveMediaUrl, uploadPropertyImage, validateImageFile } from "../../services/media";
import { formatPol } from "../../services/normalizers";

const EMPTY_FORM = {
  propertyTitle: "",
  category: CATEGORIES[0],
  images: "/portfolio/portfolio-01.jpg",
  propertyAddress: "",
  description: "",
  price: "",
};

const PRESET_IMAGES = [
  "/portfolio/portfolio-01.jpg",
  "/portfolio/portfolio-04.jpg",
  "/portfolio/portfolio-10.jpg",
  "/portfolio/portfolio-16.jpg",
];

const PropertyForm = ({
  initialValues,
  onSubmit,
  busy = false,
  submitLabel = "Create property",
  includePrice = true,
  listingPrice = "0",
  modeLabel = "Demo data",
}) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [selectedImage, setSelectedImage] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [uploadState, setUploadState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialValues });
  }, [initialValues]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const clearSelectedImage = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedImage(null);
    setLocalPreview("");
  };

  const updateImageReference = (event) => {
    clearSelectedImage();
    setUploadState({ status: "idle", message: "" });
    setForm((current) => ({ ...current, images: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateImageFile(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedImage(validationError ? null : file);
    setLocalPreview(validationError ? "" : URL.createObjectURL(file));
    setUploadState({ status: validationError ? "error" : "ready", message: validationError });
  };

  const uploadImage = async () => {
    const validationError = validateImageFile(selectedImage);
    if (validationError) {
      setUploadState({ status: "error", message: validationError });
      return;
    }
    setUploadState({ status: "uploading", message: "Uploading and pinning your image..." });
    try {
      const uploaded = await uploadPropertyImage(selectedImage);
      setForm((current) => ({ ...current, images: uploaded.ipfsUri }));
      setUploadState({ status: "success", message: `Pinned to IPFS: ${uploaded.cid}` });
    } catch (error) {
      setUploadState({ status: "error", message: error.message });
    }
  };

  const usePreset = (image) => {
    clearSelectedImage();
    setForm((current) => ({ ...current, images: image }));
    setUploadState({ status: "idle", message: "" });
  };

  const preview = localPreview || resolveMediaUrl(form.images?.trim()) || "/portfolio/portfolio-01.jpg";
  const isUploading = uploadState.status === "uploading";

  return (
    <form className="ue-property-form" onSubmit={submit}>
      <div className="ue-form-main">
        <div className="ue-form-section-heading">
          <span>01</span>
          <div><h2>Property details</h2><p>Describe the real-world property represented by this marketplace record.</p></div>
        </div>

        <div className="ue-field-grid two">
          <label className="ue-field">
            <span>Property title</span>
            <input value={form.propertyTitle} onChange={update("propertyTitle")} placeholder="e.g. Marina Skyline Office" maxLength={120} required />
          </label>
          <label className="ue-field">
            <span>Category</span>
            <select value={form.category} onChange={update("category")} required>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>

        <label className="ue-field">
          <span>Property address</span>
          <input value={form.propertyAddress} onChange={update("propertyAddress")} placeholder="Street, district, city" maxLength={220} required />
        </label>

        <label className="ue-field">
          <span>Description</span>
          <textarea value={form.description} onChange={update("description")} placeholder="Describe the space, notable features, access and surrounding area." rows={6} maxLength={2200} required />
          <small>{form.description.length}/2200 characters</small>
        </label>

        {includePrice && (
          <label className="ue-field ue-price-field">
            <span>Marketplace price</span>
            <div className="ue-input-suffix"><input type="number" min="0.000001" step="0.000001" value={form.price} onChange={update("price")} placeholder="0.00" required /><strong>POL</strong></div>
          </label>
        )}

        <div className="ue-form-section-heading second">
          <span>02</span>
          <div><h2>Property image</h2><p>Upload to IPFS, paste a public URL, or choose a supplied starter image.</p></div>
        </div>

        <div className="ue-ipfs-upload">
          <label className="ue-file-drop">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={chooseImage} />
            <span className="ue-upload-icon" aria-hidden="true">IPFS</span>
            <strong>{selectedImage ? selectedImage.name : "Choose a property image"}</strong>
            <small>JPEG, PNG, WebP, GIF or AVIF - maximum 5 MB</small>
          </label>
          <button className="ue-button dark" type="button" onClick={uploadImage} disabled={!selectedImage || isUploading}>
            {isUploading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>
        {uploadState.message && (
          <p className={`ue-upload-status ${uploadState.status}`} role="status">{uploadState.message}</p>
        )}

        <div className="ue-or-divider"><span>or use an existing image reference</span></div>

        <label className="ue-field">
          <span>Image URL</span>
          <input value={form.images} onChange={updateImageReference} placeholder="https://example.com/property.jpg or ipfs://CID" required />
          <small>IPFS uploads are stored as portable ipfs:// references.</small>
        </label>
        <div className="ue-image-presets" aria-label="Starter property images">
          {PRESET_IMAGES.map((image) => (
            <button type="button" key={image} className={form.images === image ? "active" : ""} onClick={() => usePreset(image)}>
              <img src={image} alt="Starter property" loading="lazy" /><span>{form.images === image ? "Selected" : "Use image"}</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="ue-form-preview">
        <span className="ue-eyebrow">LIVE PREVIEW</span>
        <div className="ue-preview-image"><img src={preview} alt="Property preview" onError={(event) => { event.currentTarget.src = "/portfolio/portfolio-01.jpg"; }} /><span>{form.category}</span></div>
        <h3>{form.propertyTitle || "Untitled property"}</h3>
        <p>{form.propertyAddress || "Property location"}</p>
        {includePrice && <strong>{formatPol(form.price)} POL</strong>}
        <div className="ue-publish-summary">
          <div><span>Data source</span><strong>{modeLabel}</strong></div>
          <div><span>Listing fee</span><strong>{Number(listingPrice || 0).toFixed(4)} POL</strong></div>
          <div><span>Image storage</span><strong>{String(form.images).startsWith("ipfs://") ? "IPFS" : "URL / local"}</strong></div>
        </div>
        <button className="ue-button primary wide" type="submit" disabled={busy || isUploading}>{busy ? "Waiting for confirmation..." : submitLabel}</button>
        <small className="ue-form-note">Publishing requires a connected wallet. Blockchain transactions cannot be reversed.</small>
      </aside>
    </form>
  );
};

export default PropertyForm;
