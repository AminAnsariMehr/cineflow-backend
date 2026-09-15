import { mediaRepository } from "../repositories/mediaRepository.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import { toMediaListDto, toMediaDetailsDto } from "../mappers/mediaMapper.js";
import { toFilmographyItemDto } from "../../people/mappers/peopleMapper.js";

// const normalizeSlug = (slug) => {
//   if (typeof slug !== "string") return "";
//   try {
//     return decodeURIComponent(slug).trim().toLowerCase();
//   } catch {
//     return slug.trim().toLowerCase();
//   }
// };

const normalizeSlug = (slug) => {
  if (typeof slug !== "string") {
    return "";
  }

  let decodedSlug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    throw new BadRequestError("Media slug contains invalid URL encoding");
  }

  return decodedSlug.trim().toLowerCase();
};

const normalizeQuery = (query) => {
  return query && typeof query === "object" && !Array.isArray(query)
    ? query
    : {};
};

const safeMap = (items, mapper) => {
  if (!Array.isArray(items)) return [];
  return items.map(mapper).filter(Boolean);
};

const extractId = (value) => {
  if (value == null) return null;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value.toHexString === "function"
  ) {
    return value;
  }

  if (typeof value === "object") {
    return value._id ?? value.id ?? null;
  }

  return null;
};

export const mediaService = {
  async getAllMedia(query = {}) {
    const items = await mediaRepository.findAll(normalizeQueryObject(query));
    return safeMap(items, toMediaListDto);
  },

  async getMediaBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug, { fieldName: "Media slug" });

    if (!normalizedSlug) {
      throw new BadRequestError(
        "Media slug is required and must be a valid string",
      );
    }

    const item = await mediaRepository.findBySlug(normalizedSlug);

    if (!item) {
      throw new NotFoundError(`Media with slug '${normalizedSlug}' not found`);
    }

    const rawCollection = item.collectionInfo?.collection;
    const collectionId = extractId(rawCollection);

    const collectionTimeline = collectionId
      ? await mediaRepository.findCollectionTimeline(collectionId)
      : [];

    return toMediaDetailsDto(item, collectionTimeline);
  },

  async getTop10(query = {}) {
    const items = await mediaRepository.findTop10(normalizeQueryObject(query));
    return safeMap(items, toMediaListDto);
  },

  async getTopImdb(query = {}) {
    const items = await mediaRepository.findTopImdb(
      normalizeQueryObject(query),
    );
    return safeMap(items, toMediaListDto);
  },

  async getUpcoming(query = {}) {
    const items = await mediaRepository.findUpcoming(
      normalizeQueryObject(query),
    );
    return safeMap(items, toMediaListDto);
  },

  async getAnimations(query = {}) {
    const items = await mediaRepository.findAnimations(
      normalizeQueryObject(query),
    );
    return safeMap(items, toMediaListDto);
  },

  async getPersianDubbed(query = {}) {
    const items = await mediaRepository.findPersianDubbed(
      normalizeQueryObject(query),
    );
    return safeMap(items, toMediaListDto);
  },

  async getFilmographyByPersonId(personObjectId, query = {}) {
    if (!personObjectId) {
      return [];
    }

    const items = await mediaRepository.findFilmographyByPersonId(
      personObjectId,
      normalizeQueryObject(query),
    );

    return safeMap(items, (media) =>
      toFilmographyItemDto(media, personObjectId),
    );
  },
};
