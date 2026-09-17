import { collectionRepository } from "../repositories/collectionRepository.js";
import { mediaRepository } from "#modules/media/repositories/mediaRepository";
import { toCollectionDto } from "#modules/media/mappers/mediaMapper";
import { buildPaginationMeta } from "#shared/utils/pagination.util";
import {
  normalizeSlug,
  normalizeQueryObject,
} from "#shared/utils/string.util.js";
import { NotFoundError, BadRequestError } from "#shared/errors/AppError";
import { isValidObjectId } from "#shared/utils/objectId.util";

export const collectionService = {
  async createCollection(payload) {
    if (!payload.slug && payload.title?.en) {
      payload.slug = payload.title.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    payload.slug = normalizeSlug(payload.slug, {
      fieldName: "Collection slug",
    });

    const existing = await collectionRepository.findBySlug(payload.slug);
    if (existing) {
      throw new BadRequestError(
        `Collection with slug '${payload.slug}' already exists`,
      );
    }

    const created = await collectionRepository.create(payload);
    return toCollectionDto(created);
  },

  async updateCollection(id, payload) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError("Invalid Collection ID format");
    }

    if (payload.slug) {
      payload.slug = normalizeSlug(payload.slug);
      const existing = await collectionRepository.findBySlug(payload.slug);
      if (existing && String(existing._id) !== String(id)) {
        throw new BadRequestError(`Slug '${payload.slug}' is already in use`);
      }
    }

    const updated = await collectionRepository.updateById(id, payload);
    if (!updated) {
      throw new NotFoundError("Collection not found");
    }

    return toCollectionDto(updated);
  },

  async deleteCollection(id) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError("Invalid Collection ID format");
    }

    const deleted = await collectionRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("Collection not found");
    }

    return { id, message: "Collection deleted successfully" };
  },

  async getAllCollections(query = {}) {
    const result = await collectionRepository.findAll(
      normalizeQueryObject(query),
    );
    return {
      data: result.items.map(toCollectionDto).filter(Boolean),
      pagination: buildPaginationMeta(
        result.totalItems,
        result.page,
        result.limit,
      ),
    };
  },

  async getCollectionBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug);
    const collection = await collectionRepository.findBySlug(normalizedSlug);

    if (!collection) {
      throw new NotFoundError(
        `Collection with slug '${normalizedSlug}' not found`,
      );
    }

    const timeline = await mediaRepository.findCollectionTimeline(
      collection._id,
    );

    return {
      collection: toCollectionDto(collection),
      timeline,
    };
  },
};
