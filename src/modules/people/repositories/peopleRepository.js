import { Person } from "../models/Person.js";
import {
  normalizePagination,
  buildPaginationMeta,
} from "#utils/pagination.util.js";

const DEFAULT_PERSON_PROJECTION = {
  _id: 1,
  imdbId: 1,
  slug: 1,
  name: 1,
  birthName: 1,
  birthDate: 1,
  deathDate: 1,
  birthPlace: 1,
  height: 1,
  biography: 1,
  primaryProfessions: 1,
  starmeterRank: 1,
  awardsSummary: 1,
  personalRelationships: 1,
  avatar: 1,
  images: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const peopleRepository = {
  async create(personData) {
    const person = await Person.create(personData);
    return person.toObject();
  },

  async findById(id, projection = DEFAULT_PERSON_PROJECTION) {
    return Person.findById(id, projection).lean();
  },

  async findBySlug(slug, projection = DEFAULT_PERSON_PROJECTION) {
    return Person.findOne(
      { slug: String(slug).toLowerCase() },
      projection,
    ).lean();
  },

  async findByImdbId(imdbId, projection = DEFAULT_PERSON_PROJECTION) {
    return Person.findOne({ imdbId }, projection).lean();
  },

  async findAll(queryParams = {}, projection = DEFAULT_PERSON_PROJECTION) {
    const { page, limit, skip } = normalizePagination(queryParams);
    const filter = {};

    if (queryParams.search) {
      filter.$text = { $search: queryParams.search };
    }

    if (queryParams.profession) {
      filter.$or = [
        { "primaryProfessions.en": queryParams.profession },
        { "primaryProfessions.fa": queryParams.profession },
      ];
    }

    const [items, total] = await Promise.all([
      Person.find(filter, projection)
        .sort({ starmeterRank: 1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Person.countDocuments(filter),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async updateById(id, updateData, projection = DEFAULT_PERSON_PROJECTION) {
    return Person.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, fields: projection },
    ).lean();
  },

  async deleteById(id) {
    return Person.findByIdAndDelete(id).lean();
  },
};
