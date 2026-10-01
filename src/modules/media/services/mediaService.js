import { mediaRepository } from "../repositories/mediaRepository.js";
import {
  normalizeQueryObject,
  normalizeSlug,
} from "#shared/utils/string.util.js";
import { buildPaginationMeta } from "#shared/utils/pagination.util.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import {
  toMediaListDto,
  toMediaDetailsDto,
  toMediaSliderDto,
} from "../mappers/mediaMapper.js";
import { toFilmographyItemDto } from "../../person/mappers/personMapper.js";

const IMDB_PERSON_REGEX = /^nm\d+$/;

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

  if (typeof value === "object") return value._id ?? value.id ?? null;

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
  async getFeaturedSlider(limit = 10) {
    const items = await mediaRepository.findFeaturedSlider(limit);
    return safeMap(items, toMediaSliderDto);
  },

  async updateSliderItems(items) {
    const payload = Array.isArray(items) ? items : items?.items || [];
    const result = await mediaRepository.updateSliderOrder(payload);

    return {
      success: true,
      message: "Slider items updated successfully",
      count: result.count || 0,
    };
  },

  async getAllMedia(query = {}) {
    const result = await mediaRepository.findAll(normalizeQueryObject(query));
    return formatPaginatedResult(result, toMediaListDto);
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
    const result = await mediaRepository.findAll({
      ...normalizeQueryObject(query),
      isTop10: true,
      sort: "top-imdb",
    });
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getTopImdb(query = {}) {
    const result = await mediaRepository.findAll({
      ...normalizeQueryObject(query),
      sort: "top-imdb",
    });
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getUpcoming(query = {}) {
    const result = await mediaRepository.findAll({
      ...normalizeQueryObject(query),
      isUpcoming: true,
      sort: "upcoming",
    });
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getAnimations(query = {}) {
    const result = await mediaRepository.findAll({
      ...normalizeQueryObject(query),
      genre: "Animation",
    });
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getPersianDubbed(query = {}) {
    const result = await mediaRepository.findAll({
      ...normalizeQueryObject(query),
      hasPersianDub: true,
    });
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getFilmographyByPersonId(personObjectId, query = {}) {
    if (!personObjectId) {
      return {
        data: [],
        pagination: buildPaginationMeta(0, 1, 50),
      };
    }

    const result = await mediaRepository.findFilmographyByPersonImdbId(
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

  async getFilmographyByPersonImdbId(personIMDbId, query = {}) {
    if (!personIMDbId || !IMDB_PERSON_REGEX.test(personIMDbId)) {
      throw new BadRequestError(
        "Invalid IMDb Person ID format (expected nm followed by digits)",
      );
    }

    const result = await mediaRepository.findFilmographyByPersonImdbId(
      personIMDbId,
      normalizeQueryObject(query),
    );

    return {
      data: safeMap(result.items, (media) =>
        toFilmographyItemDto(media, personIMDbId),
      ),
      pagination: buildPaginationMeta(
        result.totalItems,
        result.page,
        result.limit,
      ),
    };
  },
};
