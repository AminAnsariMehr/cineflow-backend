import { mediaRepository } from "../repositories/mediaRepository.js";

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

export const mediaService = {
  getAnimations: () =>
    mediaRepository.findLatest({
      genres: { $in: ["Animation", "انیمیشن"] },
    }),

  getPersianDubbed: () =>
    mediaRepository.findLatest({
      languages: { $in: ["Persian", "فارسی", "دوبله فارسی"] },
    }),

  getLatestSeries: () => mediaRepository.findLatest({ type: "series" }),
  getLatestMovies: () => mediaRepository.findLatest({ type: "movie" }),
  getLatestMedia: () => mediaRepository.findLatest(),

  getImdbTop: () => mediaRepository.findTopImdb(),

  async getAllMedia({ type, genre, year, language, sort, limit } = {}) {
    const filter = {};

    if (type) filter.type = type;
    if (genre) filter.genres = genre;
    if (language) filter.languages = language;

    if (year) {
      const parsedYear = Number.parseInt(year, 10);
      if (Number.isNaN(parsedYear)) {
        const error = new Error("Year must be a valid number");
        error.statusCode = 400;
        throw error;
      }
      filter.releaseYear = parsedYear;
    }

    return mediaRepository.findByFilter(filter, { sort, limit });
  },

  async getMediaBySlug(slug) {
    const media = await mediaRepository.findBySlug(slug);

    if (!media) throw notFound(`Media with slug "${slug}" not found`);

    return media;
  },
};
