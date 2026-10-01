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
      { slug: String(slug).toLowerCase().trim() },
      projection,
    ).lean();
  },

  async findExistingSlugsByPrefix(baseSlug) {
    const regex = new RegExp(`^${baseSlug}(?:-\\d+)?$`, "i");
    const docs = await Person.find({ slug: regex }, { slug: 1, _id: 1 }).lean();
    return docs;
  },

  async findByImdbId(imdbId, projection = DEFAULT_PERSON_PROJECTION) {
    if (!imdbId) return null;
    return Person.findOne(
      { imdbId: String(imdbId).trim().toLowerCase() },
      projection,
    ).lean();
  },

  async findByIdentifier(identifier, projection = DEFAULT_PERSON_PROJECTION) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();

    const conditions = [];

    if (/^nm\d+$/i.test(cleanId)) {
      conditions.push({ imdbId: cleanId.toLowerCase() });
    }
    if (mongoose.isValidObjectId(cleanId)) {
      conditions.push({ _id: cleanId });
    }
    conditions.push({ slug: cleanId.toLowerCase() });

    if (conditions.length === 1) {
      return Person.findOne(conditions[0], projection).lean();
    }

    return Person.findOne({ $or: conditions }, projection).lean();
  },

  async findAll(queryParams = {}, projection = DEFAULT_PERSON_PROJECTION) {
    const { page, limit, skip } = normalizePagination(queryParams);
    const filter = {};
    const isSearch = Boolean(queryParams.search?.trim());

    if (isSearch) {
      filter.$text = { $search: queryParams.search.trim() };
    }

    // ۱. فیلتر حرفه (اگر ارسال شد از همان، در غیر این‌صورت پیش‌فرض بازیگر)
    const profession = queryParams.profession?.trim();
    if (profession) {
      filter.$or = [
        { "primaryProfessions.en": profession },
        { "primaryProfessions.fa": profession },
      ];
    } else if (!isSearch) {
      filter.$or = [
        { "primaryProfessions.en": { $in: ["actor", "actress"] } },
        { "primaryProfessions.fa": "بازیگر" },
      ];
    }

    // ۲. حذف رکوردهایی که starmeterRank ندارند تا با سورت صعودی در ابتدای لیست نیایند
    if (!isSearch) {
      filter.starmeterRank = { $ne: null, $gt: 0 };
    }

    // ۳. سورت بر اساس محبوبیت (کمترین رنک استارمتر یعنی محبوب‌ترین)
    const sortCriteria = isSearch
      ? { score: { $meta: "textScore" }, starmeterRank: 1 }
      : { starmeterRank: 1, _id: -1 };

    const queryProjection = isSearch
      ? { ...projection, score: { $meta: "textScore" } }
      : projection;

    const [items, total] = await Promise.all([
      Person.find(filter, queryProjection)
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
