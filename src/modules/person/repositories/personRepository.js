import mongoose from "mongoose";
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

export const personRepository = {
  async create(personData) {
    const person = await Person.create(personData);
    return person.toObject();
  },

  async findById(id, projection = DEFAULT_PERSON_PROJECTION) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Person.findById(id, projection).lean();
  },

  async findBySlug(slug, projection = DEFAULT_PERSON_PROJECTION) {
    if (!slug) return null;
    return Person.findOne(
      { slug: String(slug).toLowerCase() },
      projection,
    ).lean();
  },

  async findByImdbId(imdbId, projection = DEFAULT_PERSON_PROJECTION) {
    if (!imdbId) return null;
    return Person.findOne({ imdbId: String(imdbId).trim() }, projection).lean();
  },

  async findByIdentifier(identifier, projection = DEFAULT_PERSON_PROJECTION) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();

    // ۱. بررسی شناسه IMDB
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

    // ۳. جستجو بر اساس اسلاگ
    return Person.findOne({ slug: cleanId.toLowerCase() }, projection).lean();
  },

  async findAll(queryParams = {}, projection = DEFAULT_PERSON_PROJECTION) {
    const { page, limit, skip } = normalizePagination(queryParams);
    const filter = {};
    const isSearch = Boolean(queryParams.search?.trim());

    if (isSearch) {
      filter.$text = { $search: queryParams.search.trim() };
    }

    if (queryParams.profession?.trim()) {
      const prof = queryParams.profession.trim();
      filter.$or = [
        { "primaryProfessions.en": prof },
        { "primaryProfessions.fa": prof },
      ];
    }

    // بهینه‌سازی: عدم استفاده از پایپ‌لاین سنگین $facet به نفع ایندکس B-Tree
    // تفکیک مرتب‌سازی بر اساس ایندکس واقعی موجود در دیتابیس
    const sortCriteria = isSearch
      ? { score: { $meta: "textScore" }, starmeterRank: 1 }
      : { starmeterRank: 1, _id: -1 };

    const queryOptions = isSearch ? { score: { $meta: "textScore" } } : {};

    const [items, total] = await Promise.all([
      Person.find(filter, { ...projection, ...queryOptions })
        .sort(sortCriteria)
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
    if (!mongoose.isValidObjectId(id)) return null;

    return Person.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, projection },
    ).lean();
  },

  async deleteById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Person.findByIdAndDelete(id).lean();
  },
};
