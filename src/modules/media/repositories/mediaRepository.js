import { Media } from "../models/Media.js";
import { normalizeLimit } from "../../../shared/utils/query.util.js";
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
  async findAll({ type, genre, limit } = {}) {
    const filter = {};

    const normalizedType = normalizeStringQuery(type);
    const normalizedGenre = normalizeStringQuery(genre);

    if (normalizedType) filter.type = normalizedType;
    if (normalizedGenre) filter.genres = normalizedGenre;

    return Media.find(filter)
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1, _id: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findBySlug(slug) {
    const normalizedSlug = normalizeStringQuery(slug);
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

  async findTop10({ limit } = {}) {
    return Media.find({
      isTop10: true,
      "rating.imdb": { $exists: true, $ne: null },
    })
      .select(MEDIA_LIST_PROJECTION)
      .sort({
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      })
      .limit(normalizeLimit(limit, 10, 10))
      .lean();
  },

  async findTopImdb({ limit } = {}) {
    return Media.find({
      "rating.imdb": { $exists: true, $ne: null },
    })
      .select(MEDIA_LIST_PROJECTION)
      .sort({
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findUpcoming({ limit } = {}) {
    return Media.find({ isUpcoming: true })
      .select(MEDIA_LIST_PROJECTION)
      .sort({
        releaseYear: 1,
        createdAt: -1,
        _id: -1,
      })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findAnimations({ limit } = {}) {
    return Media.find({ genres: "Animation" })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1, _id: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findPersianDubbed({ limit } = {}) {
    return Media.find({
      languages: { $in: ["دوبله فارسی", "فارسی", "Persian"] },
    })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1, _id: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findFilmographyByPersonId(personObjectId, { limit } = {}) {
    if (!personObjectId) return [];

    return Media.find({
      $or: [
        { "credits.cast.person": personObjectId },
        { "credits.directors": personObjectId },
        { "credits.writers": personObjectId },
      ],
    })
      .select({
        ...MEDIA_LIST_PROJECTION,
        credits: 1,
      })
      .sort({
        releaseYear: -1,
        createdAt: -1,
        _id: -1,
      })
      .limit(normalizeLimit(limit, 50, 100))
      .lean();
  },
};
