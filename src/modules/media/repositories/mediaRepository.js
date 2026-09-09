import { Media } from "../models/Media.js";

const normalizeLimit = (limit, defaultValue = 20, max = 100) => {
  const parsed = Number(limit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return Math.min(parsed, max);
};

export const mediaRepository = {
  async findAll({ filter = {}, sort = "latest", limit = 20 } = {}) {
    const normalizedLimit = normalizeLimit(limit);

    const sortOption =
      sort === "rating"
        ? { "rating.imdb": -1 }
        : sort === "oldest"
          ? { releaseYear: 1 }
          : { releaseYear: -1, createdAt: -1 };

    return Media.find(filter).sort(sortOption).limit(normalizedLimit).lean();
  },

  async findBySlug(slug) {
    return Media.findOne({ slug })
      .populate("credits.cast.person", "name slug avatar primaryProfessions")
      .populate("credits.directors", "name slug avatar primaryProfessions")
      .populate("credits.writers", "name slug avatar primaryProfessions")
      .lean();
  },

  async findTop10(limit = 10) {
    return Media.find({ isTop10: true })
      .sort({ "rating.imdb": -1, createdAt: -1 })
      .limit(normalizeLimit(limit, 10, 20))
      .lean();
  },

  async findUpcoming(limit = 10) {
    return Media.find({ isUpcoming: true })
      .sort({ releaseYear: 1, createdAt: -1 })
      .limit(normalizeLimit(limit, 10, 20))
      .lean();
  },

  async findTopImdb(limit = 10) {
    return Media.find({
      "rating.imdb": { $ne: null, $type: "number" },
    })
      .sort({ "rating.imdb": -1, createdAt: -1 })
      .limit(normalizeLimit(limit, 10, 20))
      .lean();
  },

  async findByCustomFilter(
    filter,
    { limit = 20, sort = { createdAt: -1 } } = {},
  ) {
    return Media.find(filter).sort(sort).limit(normalizeLimit(limit)).lean();
  },
};
