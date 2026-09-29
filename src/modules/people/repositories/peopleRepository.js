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

  async findByIdentifier(identifier, projection = DEFAULT_PERSON_PROJECTION) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();

    // ۱. بررسی فرمت IMDb ID (معمولاً با nm شروع می‌شود)
    if (/^nm\d+$/i.test(cleanId)) {
      const byImdb = await Person.findOne(
        { imdbId: cleanId },
        projection,
      ).lean();
      if (byImdb) return byImdb;
    }

    // ۲. بررسی شناسه MongoDB ObjectId
    if (mongoose.isValidObjectId(cleanId)) {
      const byId = await Person.findById(cleanId, projection).lean();
      if (byId) return byId;
    }

    // ۳. پیش‌فرض جستجو بر اساس slug
    return Person.findOne({ slug: cleanId.toLowerCase() }, projection).lean();
  },

  async findAll(queryParams = {}, projection = DEFAULT_PERSON_PROJECTION) {
    const { page, limit, skip } = normalizePagination(queryParams);
    const matchFilter = {};
    const isSearch = Boolean(queryParams.search);

    if (isSearch) {
      matchFilter.$text = { $search: queryParams.search };
    }

    if (queryParams.profession) {
      matchFilter.$or = [
        { "primaryProfessions.en": queryParams.profession },
        { "primaryProfessions.fa": queryParams.profession },
      ];
    }

    const pipeline = [
      { $match: matchFilter },
      {
        $addFields: {
          hasRank: {
            $cond: [
              {
                $and: [
                  { $ne: ["$starmeterRank", null] },
                  { $gt: ["$starmeterRank", 0] },
                ],
              },
              1,
              0,
            ],
          },
          ...(isSearch ? { score: { $meta: "textScore" } } : {}),
        },
      },
      {
        $sort: isSearch
          ? { score: { $meta: "textScore" }, hasRank: -1, starmeterRank: 1 }
          : { hasRank: -1, starmeterRank: 1, _id: -1 },
      },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }, { $project: projection }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Person.aggregate(pipeline).allowDiskUse(true);
    const items = result?.items ?? [];
    const total = result?.totalCount?.[0]?.count ?? 0;

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
