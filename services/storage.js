const clone = (value) => {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
};

const readStoredJson = (storage, key, fallback, legacyKey = "") => {
  if (!storage) return clone(fallback);
  try {
    const value = storage.getItem(key) || (legacyKey ? storage.getItem(legacyKey) : null);
    return value ? JSON.parse(value) : clone(fallback);
  } catch (_) {
    return clone(fallback);
  }
};

const writeStoredJson = (storage, key, value) => {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
};

const DEMO_STORAGE_KEYS = Object.freeze({
  properties: "unlock-estate-demo:v1:properties",
  reviews: "unlock-estate-demo:v1:reviews",
  likes: "unlock-estate-demo:v1:likes",
});

const LEGACY_STORAGE_KEYS = Object.freeze({
  properties: "unlock-estate-properties",
  reviews: "unlock-estate-reviews",
});

module.exports = {
  DEMO_STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  readStoredJson,
  writeStoredJson,
};
