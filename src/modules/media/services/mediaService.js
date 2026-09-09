import { mediaRepository } from "../repositories/mediaRepository.js";

const ALLOWED_TYPES = ["movie", "series"];
const ALLOWED_SORTS = ["latest", "oldest", "rating"];

export const mediaService = {
  async getAllMedia(query = {}) {
    const { type, genre, language, sort = "latest", limit = 20 } = query;

    const filter = {};

    if (type) {
      if (!ALLOWED_TYPES.includes(type)) {
        const error = new Error("Type must be either 'movie' or 'series'");
        error.statusCode = 400;
        throw error;
      }

      filter.type = type;
    }

    if (sort && !ALLOWED_SORTS.includes(sort)) {
      const error = new Error("Sort must be one of: latest, oldest, rating");
      error.statusCode = 400;
      throw error;
    }

    if (genre) {
      const genres = genre.split(",").map((item) => item.trim());
      filter.genres = { $in: genres };
    }

    if (language) {
      const languages = language.split(",").map((item) => item.trim());
      filter.languages = { $in: languages };
    }

    return mediaRepository.findAll({ filter, sort, limit });
  },

  async getMediaBySlug(slug) {
    const media = await mediaRepository.findBySlug(slug);

    if (!media) {
      const error = new Error("Media not found");
      error.statusCode = 404;
      throw error;
    }

    return media;
  },

  async getTop10Media(limit) {
    return mediaRepository.findTop10(limit);
  },

  async getUpcomingMedia(limit) {
    return mediaRepository.findUpcoming(limit);
  },

  async getTopImdbMedia(limit) {
    return mediaRepository.findTopImdb(limit);
  },

  async getAnimations(limit = 20) {
    return mediaRepository.findByCustomFilter(
      {
        genres: { $in: ["Animation", "انیمیشن"] },
      },
      {
        limit,
        sort: { releaseYear: -1, createdAt: -1 },
      },
    );
  },

  async getPersianDubbed(limit = 20) {
    return mediaRepository.findByCustomFilter(
      {
        languages: { $in: ["Persian", "فارسی", "دوبله فارسی"] },
      },
      {
        limit,
        sort: { releaseYear: -1, createdAt: -1 },
      },
    );
  },
};
