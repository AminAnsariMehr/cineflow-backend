import { BadRequestError } from "../errors/AppError.js";

export const normalizeSlug = (
  value,
  {
    fieldName = "slug",
    invalidEncodingMessage = `${fieldName} contains invalid URL encoding`,
  } = {},
) => {
  if (typeof value !== "string") {
    return "";
  }

  let decodedValue;

  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    throw new BadRequestError(invalidEncodingMessage);
  }

  return decodedValue.trim().toLowerCase();
};

export const normalizeQueryObject = (query) => {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  return query;
};
