const requiredText = (value) => String(value || "").trim();
const { validateImageReference } = require("./media");

const validatePropertyForm = (form = {}) => {
  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) return "Price must be greater than zero.";
  if (!requiredText(form.propertyTitle)) return "Property title is required.";
  if (!requiredText(form.category)) return "Category is required.";
  const imageError = validateImageReference(form.images);
  if (imageError) return imageError;
  if (!requiredText(form.propertyAddress)) return "Property address is required.";
  if (!requiredText(form.description)) return "Description is required.";
  return "";
};

const validateReview = (rating, comment) => {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return "Rating must be between 1 and 5.";
  }
  if (!requiredText(comment)) return "Comment is required.";
  return "";
};

module.exports = { validatePropertyForm, validateReview };
