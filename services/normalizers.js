const { ethers } = require("ethers");

const asString = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return value?.toString?.() ?? String(value);
};

const formatPrice = (value) => {
  if (ethers.BigNumber.isBigNumber(value)) return ethers.utils.formatEther(value);
  return asString(value, "0");
};

const normalizeProperty = (property = {}) => {
  const price = property.price ?? property[2];
  return {
    productID: asString(property.productID ?? property[0], "0"),
    owner: property.owner ?? property[1] ?? "",
    price: formatPrice(price),
    propertyTitle: property.propertyTitle ?? property[3] ?? "",
    category: property.category ?? property[4] ?? "",
    images: property.images ?? property[5] ?? "",
    propertyAddress: property.propertyAddress ?? property[6] ?? "",
    description: property.description ?? property[7] ?? "",
    reviewers: property.reviewers ?? property[8] ?? [],
    reviews: property.reviews ?? property[9] ?? [],
  };
};

const normalizeReview = (review = {}) => ({
  reviewer: review.reviewer ?? review[0] ?? "",
  productId: asString(review.productId ?? review[1], "0"),
  rating: Number(review.rating ?? review[2] ?? 0),
  comment: review.comment ?? review[3] ?? "",
  likes: Number(asString(review.likes ?? review[4], "0")),
  reviewIndex: asString(review.reviewIndex ?? review[5], "0"),
});

const shortAddress = (address = "") =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected";

const formatPol = (value, minimumDecimals = 2) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return Number(0).toFixed(minimumDecimals);
  const decimals = amount > 0 && Math.abs(amount) < 0.01 ? 4 : minimumDecimals;
  return amount.toFixed(decimals);
};

module.exports = { formatPol, normalizeProperty, normalizeReview, shortAddress };
