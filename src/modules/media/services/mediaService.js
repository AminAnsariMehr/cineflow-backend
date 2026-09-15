import { mediaRepository } from "../repositories/mediaRepository.js";
import { normalizeQueryObject, normalizeSlug } from "#shared/utils/string.util";
import { buildPaginationMeta } from "#shared/utils/pagination.util";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import { toMediaListDto, toMediaDetailsDto } from "../mappers/mediaMapper.js";
import { toFilmographyItemDto } from "../../people/mappers/peopleMapper.js";

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

const formatPaginatedResult = (result, mapper) => {
  const { items = [], totalItems = 0, page = 1, limit = 20 } = result || {};
  return {
    data: safeMap(items, mapper),
    pagination: buildPaginationMeta(totalItems, page, limit),
  };
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
    return formatPaginatedResult(items, toMediaListDto);
  },

  async getTopImdb(query = {}) {
    const items = await mediaRepository.findTopImdb(
      normalizeQueryObject(query),
    );
    return formatPaginatedResult(items, toMediaListDto);
  },

  async getUpcoming(query = {}) {
    const items = await mediaRepository.findUpcoming(
      normalizeQueryObject(query),
    );
    return formatPaginatedResult(items, toMediaListDto);
  },

  async getAnimations(query = {}) {
    const items = await mediaRepository.findAnimations(
      normalizeQueryObject(query),
    );
    return formatPaginatedResult(items, toMediaListDto);
  },

  async getPersianDubbed(query = {}) {
    const result = await mediaRepository.findPersianDubbed(
      normalizeQueryObject(query),
    );
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getFilmographyByPersonId(personObjectId, query = {}) {
    if (!personObjectId) {
      return {
        data: [],
        pagination: buildPaginationMeta(0, 1, 50),
      };
    }

    const result = await mediaRepository.findFilmographyByPersonId(
      personObjectId,
      normalizeQueryObject(query),
    );

    return {
      data: safeMap(result.items, (media) =>
        toFilmographyItemDto(media, personObjectId),
      ),
      pagination: buildPaginationMeta(
        result.totalItems,
        result.page,
        result.limit,
      ),
    };
  },
};
