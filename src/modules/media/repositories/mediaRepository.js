import { Media } from "../models/Media.js";
import { normalizeLimit } from "../../../shared/utils/query.util.js";
import {
  MEDIA_LIST_PROJECTION,
  MEDIA_DETAILS_PROJECTION,
  PERSON_SUMMARY_PROJECTION,
  COLLECTION_TIMELINE_PROJECTION,
} from "./media.projections.js";

export const mediaRepository = {
  async findAll({ type, genre, limit } = {}) {
    const filter = {};
    // if (type) filter.type = type;
    // if (genre) filter.genres = genre;

    if (typeof type === "string") filter.type = type;
    if (typeof genre === "string") filter.genres = genre;

    return Media.find(filter)
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findBySlug(slug) {
    return Media.findOne({ slug })
      .select(MEDIA_DETAILS_PROJECTION)
      .populate("credits.cast.person", PERSON_SUMMARY_PROJECTION)
      .populate("credits.directors", PERSON_SUMMARY_PROJECTION)
      .populate("credits.writers", PERSON_SUMMARY_PROJECTION)
      .populate("collectionInfo.collection")
      .lean();
  },

  async findCollectionTimeline(collectionId) {
    return Media.find({ "collectionInfo.collection": collectionId })
      .select(COLLECTION_TIMELINE_PROJECTION)
      .sort({ "collectionInfo.order": 1 })
      .lean();
  },

  async findTop10({ limit } = {}) {
    return Media.find({ isTop10: true })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ "rating.imdb": -1, createdAt: -1 })
      .limit(normalizeLimit(limit, 10, 10))
      .lean();
  },

  async findTopImdb({ limit } = {}) {
    return Media.find({ "rating.imdb": { $ne: null } })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ "rating.imdb": -1, "rating.voteCount": -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findUpcoming({ limit } = {}) {
    return Media.find({ isUpcoming: true })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ releaseYear: 1, createdAt: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findAnimations({ limit } = {}) {
    return Media.find({ genres: "Animation" })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findPersianDubbed({ limit } = {}) {
    return Media.find({
      languages: { $in: ["دوبله فارسی", "فارسی", "Persian"] },
    })
      .select(MEDIA_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findFilmographyByPersonId(personObjectId, { limit } = {}) {
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
      .sort({ releaseYear: -1, createdAt: -1 })
      .limit(normalizeLimit(limit, 50, 100))
      .lean();
  },
};
