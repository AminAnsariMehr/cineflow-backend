import { Person } from "../models/Person.js";
import { normalizeLimit } from "../../../shared/utils/query.util.js";

const PERSON_PUBLIC_PROJECTION = {
  _id: 1,
  slug: 1,
  name: 1,
  biography: 1,
  birthDate: 1,
  deathDate: 1,
  birthPlace: 1,
  avatar: 1,
  primaryProfessions: 1,
};

const normalizeStringQuery = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
};

export const peopleRepository = {
  async findAll({ profession, limit } = {}) {
    const filter = {};
    const normalizedProfession = normalizeStringQuery(profession);

    if (normalizedProfession) {
      filter.primaryProfessions = normalizedProfession;
    }

    return Person.find(filter)
      .select(PERSON_PUBLIC_PROJECTION)
      .sort({
        "name.en": 1,
        _id: 1,
      })
      .limit(normalizeLimit(limit))
      .lean();
  },

  async findBySlug(slug) {
    return Person.findOne({
      slug,
    })
      .select(PERSON_PUBLIC_PROJECTION)
      .lean();
  },
};
