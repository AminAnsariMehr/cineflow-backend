import { Media } from "../models/Media.js";
import { normalizePagination } from "../../../shared/utils/pagination.util.js";
import {
  MEDIA_LIST_PROJECTION,
  MEDIA_DETAILS_PROJECTION,
  PERSON_SUMMARY_PROJECTION,
  COLLECTION_TIMELINE_PROJECTION,
  COLLECTION_SUMMARY_PROJECTION,
} from "./media.projections.js";

const normalizeStringQuery = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
};

export const mediaRepository = {
  async findAll(query = {}) {
    const filter = {};
    const { type, genre, language } = query;

    const normalizedType = normalizeStringQuery(type);
    const normalizedGenre = normalizeStringQuery(genre);
    const normalizedLanguage = normalizeStringQuery(language);

    if (normalizedType) filter.type = normalizedType;
    if (normalizedGenre) filter.genres = normalizedGenre;
    if (normalizedLanguage) filter.languages = normalizedLanguage;

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findBySlug(slug) {
    const normalizedSlug = normalizeSlugParam(slug);
    if (!normalizedSlug) return null;

    return Media.findOne({ slug: normalizedSlug })
      .select(MEDIA_DETAILS_PROJECTION)
      .populate({
        path: "credits.cast.person",
        select: PERSON_SUMMARY_PROJECTION,
      })
      .populate({
        path: "credits.directors",
        select: PERSON_SUMMARY_PROJECTION,
      })
      .populate({
        path: "credits.writers",
        select: PERSON_SUMMARY_PROJECTION,
      })
      .populate({
        path: "collectionInfo.collection",
        select: COLLECTION_SUMMARY_PROJECTION,
      })
      .lean();
  },

  async findCollectionTimeline(collectionId) {
    if (!collectionId) return [];

    return Media.find({
      "collectionInfo.collection": collectionId,
    })
      .select(COLLECTION_TIMELINE_PROJECTION)
      .sort({
        "collectionInfo.order": 1,
        _id: 1,
      })
      .lean();
  },

  async findTop10(query = {}) {
    const filter = {
      isTop10: true,
      "rating.imdb": { $gt: 0 },
    };

    const { page, limit, skip } = normalizePagination(query, 10, 10);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({
          "rating.imdb": -1,
          "rating.voteCount": -1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findTopImdb(query = {}) {
    const filter = {
      "rating.imdb": { $gt: 0 },
    };

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({
          "rating.imdb": -1,
          "rating.voteCount": -1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findUpcoming(query = {}) {
    const filter = { isUpcoming: true };
    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({
          releaseYear: 1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findAnimations(query = {}) {
    const filter = { genres: "Animation" };
    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findPersianDubbed(query = {}) {
    const filter = { hasPersianDub: true };
    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findFilmographyByPersonId(personObjectId, query = {}) {
    if (!personObjectId) {
      return { items: [], totalItems: 0, page: 1, limit: 50 };
    }

    const filter = {
      $or: [
        { "credits.cast.person": personObjectId },
        { "credits.directors": personObjectId },
        { "credits.writers": personObjectId },
      ],
    };

    const { page, limit, skip } = normalizePagination(query, 50, 100);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select({
          ...MEDIA_LIST_PROJECTION,
          credits: 1,
        })
        .sort({
          releaseYear: -1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },
};

const normalizeSlugParam = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
};
