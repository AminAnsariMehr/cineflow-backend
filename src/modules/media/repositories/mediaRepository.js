import Media from "../models/Media.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export const normalizeLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
};

export const mediaRepository = {
  async findLatest(filter = {}, { limit = DEFAULT_LIMIT } = {}) {
    return Media.find(filter)
      .sort({ releaseYear: -1, createdAt: -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findTopImdb({ limit = DEFAULT_LIMIT } = {}) {
    return Media.find({ "rating.imdb": { $exists: true } })
      .sort({ "rating.imdb": -1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findByFilter(filter = {}, { sort, limit } = {}) {
    const sortOption =
      sort === "rating"
        ? { "rating.imdb": -1 }
        : sort === "oldest"
          ? { releaseYear: 1 }
          : { releaseYear: -1, createdAt: -1 };

    return Media.find(filter)
      .sort(sortOption)
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findBySlug(slug) {
    return Media.findOne({ slug })
      .populate("crew.directors", "id name")
      .populate("crew.writers", "id name")
      .populate("crew.actors.actor", "id name")
      .lean();
  },
};
