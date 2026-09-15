import { Person } from "../models/Person.js";
import { normalizePagination } from "../../../shared/utils/pagination.util.js";

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
  async findAll(query = {}) {
    const filter = {};
    const { profession } = query;
    const normalizedProfession = normalizeStringQuery(profession);

    if (normalizedProfession) {
      filter.primaryProfessions = normalizedProfession;
    }

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Person.find(filter)
        .select(PERSON_PUBLIC_PROJECTION)
        .sort({
          "name.en": 1,
          _id: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Person.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findBySlug(slug) {
    return Person.findOne({
      slug,
    })
      .select(PERSON_PUBLIC_PROJECTION)
      .lean();
  },
};
