import mongoose from "mongoose";

import { mediaRepository } from "../repositories/mediaRepository.js";
import {
  normalizeQueryObject,
  normalizeSlug,
} from "#shared/utils/string.util.js";
import { buildPaginationMeta } from "#shared/utils/pagination.util.js";
import { NotFoundError, BadRequestError } from "#shared/errors/AppError.js";
import {
  toMediaListDto,
  toMediaDetailsDto,
  toMediaSliderDto,
} from "../mappers/mediaMapper.js";
import { toFilmographyItemDto } from "../../person/mappers/personMapper.js";

import { Person } from "#modules/person/models/Person.js";

const IMDB_PERSON_REGEX = /^nm\d+$/i;

const safeMap = (items, mapper) => {
  if (!Array.isArray(items)) return [];
  return items.map(mapper).filter(Boolean);
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

  async updateSliderItems(payload) {
    const items = Array.isArray(payload) ? payload : payload?.items || [];
    if (!Array.isArray(items)) {
      throw new BadRequestError("Payload must be an array of slider items.");
    }

    const result = await mediaRepository.updateSliderOrder(items);

    return {
      message: "Slider items updated successfully",
      count: result.count,
    };
  },

  async getAllMedia(query = {}) {
    const result = await mediaRepository.findAll(normalizeQueryObject(query));
    return formatPaginatedResult(result, toMediaListDto);
  },

  async getMediaByIdentifier(identifier) {
    if (!identifier) {
      const error = new Error("Identifier is required");
      error.statusCode = 400;
      throw error;
    }

    const media = await mediaRepository.findByIdentifier(identifier);

    if (!media) {
      const error = new Error(`Media not found with identifier: ${identifier}`);
      error.statusCode = 404;
      throw error;
    }
    // =====================================================================

    const sections = ["cast", "directors", "writers", "crew"];
    const missingImdbIds = new Set();

    sections.forEach((sec) => {
      const list = media.credits?.[sec];
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (!item.person && item.personIMDbId) {
            missingImdbIds.add(item.personIMDbId.trim().toLowerCase());
          }
        });
      }
    });

    if (missingImdbIds.size > 0) {
      const idsArray = Array.from(missingImdbIds);

      const regexList = idsArray.map((id) => new RegExp(`^${id}$`, "i"));

      const foundPersons = await Person.find({
        imdbId: { $in: regexList },
      })
        .select("imdbId slug name avatar")
        .lean();

      const personMap = new Map();
      foundPersons.forEach((p) => {
        if (p.imdbId) {
          personMap.set(p.imdbId.toLowerCase().trim(), p);
        }
      });

      sections.forEach((sec) => {
        const list = media.credits?.[sec];
        if (Array.isArray(list)) {
          list.forEach((item) => {
            if (!item.person && item.personIMDbId) {
              const key = item.personIMDbId.toLowerCase().trim();
              item.person = personMap.get(key) || null;
            }
          });
        }
      });
    }

    // =====================================================================

    const collectionTimelinesMap = {};

    if (Array.isArray(media.collections) && media.collections.length > 0) {
      await Promise.all(
        media.collections.map(async (col) => {
          const colId = col.collectionRef?._id ?? col.collectionRef;
          if (colId) {
            const timelineDocs =
              await mediaRepository.findCollectionTimeline(colId);
            collectionTimelinesMap[String(colId)] = timelineDocs;
          }
        }),
      );
    }

    return toMediaDetailsDto(media, collectionTimelinesMap);
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

    const result = await mediaRepository.findFilmographyByPersonObjectId(
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
        "Invalid IMDb Person ID format (expected 'nm' followed by digits)",
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
