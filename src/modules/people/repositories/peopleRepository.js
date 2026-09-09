import { Person } from "../models/Person.js";
import { Media } from "../../media/models/Media.js";

const normalizeLimit = (limit, defaultValue = 50, max = 100) => {
  const parsed = Number(limit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return Math.min(parsed, max);
};

export const peopleRepository = {
  async findAll({ limit = 50 } = {}) {
    return Person.find()
      .sort({ "name.en": 1 })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findBySlug(slug) {
    return Person.findOne({ slug }).lean();
  },

  async findFilmographyByPersonId(personId) {
    const [asCast, asDirector, asWriter] = await Promise.all([
      Media.find({ "credits.cast.person": personId })
        .select("id title slug releaseYear poster type rating credits.cast")
        .sort({ releaseYear: -1, createdAt: -1 })
        .lean(),

      Media.find({ "credits.directors": personId })
        .select("id title slug releaseYear poster type rating")
        .sort({ releaseYear: -1, createdAt: -1 })
        .lean(),

      Media.find({ "credits.writers": personId })
        .select("id title slug releaseYear poster type rating")
        .sort({ releaseYear: -1, createdAt: -1 })
        .lean(),
    ]);

    return {
      asCast,
      asDirector,
      asWriter,
    };
  },
};
