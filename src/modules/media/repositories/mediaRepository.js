import { Media } from "../models/Media.js";
import mongoose from "mongoose";
import { normalizePagination } from "../../../shared/utils/pagination.util.js";
import {
  MEDIA_LIST_PROJECTION,
  MEDIA_SLIDER_PROJECTION,
  MEDIA_DETAILS_PROJECTION,
  PERSON_SUMMARY_PROJECTION,
  COLLECTION_TIMELINE_PROJECTION,
  COLLECTION_SUMMARY_PROJECTION,
} from "./media.projections.js";

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseBoolean = (val) =>
  val === true || val === "true" || val === 1 || val === "1";

const normalizeSlugParam = (value) => normalizeString(value);

export const mediaRepository = {
  async findFeaturedSlider(limit = 10) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 20);

    return Media.find({ isFeatured: true })
      .select(MEDIA_SLIDER_PROJECTION)
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(safeLimit)
      .lean();
  },

  async updateSliderOrder(items = []) {
    // ۱. استخراج آرایه با پشتیبانی از هر دو فرمت: آرایه مستقیم یا آبجکت { items: [...] }
    const list = Array.isArray(items) ? items : items?.items || [];
    if (!list.length) return { matchedCount: 0, modifiedCount: 0, count: 0 };

    // ۲. ریست کردن اسلایدرهای قبلی
    await Media.updateMany(
      { isFeatured: true },
      { $set: { isFeatured: false, featuredOrder: 0 } },
    );

    // ۳. آماده‌سازی عملیات bulkWrite (پشتیبانی هوشمند از imdbId مثل tt123... و ObjectId)
    const operations = list.map((item, index) => {
      const rawId =
        typeof item === "object" && item !== null
          ? item.id || item._id || item.imdbId
          : item;

      const order =
        typeof item === "object" && item?.order !== undefined
          ? item.order
          : index + 1;

      const idStr = String(rawId || "").trim();
      const isMongoId =
        mongoose.Types.ObjectId.isValid(idStr) &&
        String(new mongoose.Types.ObjectId(idStr)) === idStr;

      const filter = isMongoId
        ? { _id: new mongoose.Types.ObjectId(idStr) }
        : { imdbId: idStr };

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              isFeatured: true,
              featuredOrder: order,
            },
          },
        },
      };
    });

    const result = await Media.bulkWrite(operations);

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      count: result.matchedCount,
    };
  },

  async findAll(query = {}) {
    const {
      type,
      genre,
      language,
      hasPersianDub,
      isUpcoming,
      isTop10,
      sort = "latest",
    } = query;

    const filter = {};
    const andConditions = [];

    const cleanType = normalizeString(type);
    if (cleanType && ["movie", "series"].includes(cleanType.toLowerCase())) {
      filter.type = cleanType.toLowerCase();
    }

    const cleanGenre = normalizeString(genre);
    if (cleanGenre) {
      andConditions.push({
        $or: [
          {
            "genres.en": {
              $regex: new RegExp(`^${escapeRegex(cleanGenre)}$`, "i"),
            },
          },
          { "genres.fa": cleanGenre },
        ],
      });
    }

    const cleanLanguage = normalizeString(language);
    if (cleanLanguage) {
      andConditions.push({
        $or: [
          {
            "languages.en": {
              $regex: new RegExp(`^${escapeRegex(cleanLanguage)}$`, "i"),
            },
          },
          { "languages.fa": cleanLanguage },
        ],
      });
    }

    if (hasPersianDub !== undefined && parseBoolean(hasPersianDub)) {
      filter.hasPersianDub = true;
    }

    if (isUpcoming !== undefined && parseBoolean(isUpcoming)) {
      filter.isUpcoming = true;
    }

    if (isTop10 !== undefined && parseBoolean(isTop10)) {
      filter.isTop10 = true;
      filter["rating.imdb"] = { $gt: 0 };
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    let sortOption = { createdAt: -1, _id: -1 };

    switch (sort) {
      case "top-imdb":
        filter["rating.imdb"] = { $gt: 0 };
        sortOption = {
          "rating.imdb": -1,
          "rating.voteCount": -1,
          createdAt: -1,
          _id: -1,
        };
        break;
      case "upcoming":
        sortOption = { releaseYear: 1, createdAt: -1, _id: -1 };
        break;
      case "latest-release":
        sortOption = { releaseYear: -1, createdAt: -1, _id: -1 };
        break;
      case "latest":
      default:
        sortOption = { createdAt: -1, _id: -1 };
        break;
    }

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select(MEDIA_LIST_PROJECTION)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findBySlug(slug) {
    const normalizedSlug = normalizeSlugParam(slug);
    if (!normalizedSlug) return null;

    return Media.findOne({ slug: normalizedSlug })
      .select(MEDIA_DETAILS_PROJECTION)
      .populate({
        path: "credits.cast.person",
        select: PERSON_SUMMARY_PROJECTION,
      })
      .populate({
        path: "collections.collectionRef",
        select: COLLECTION_SUMMARY_PROJECTION,
      })
      .lean();
  },

  async findCollectionTimeline(collectionId) {
    if (!collectionId) return [];

    return Media.find({
      "collectionInfo.collectionRef": collectionId,
    })
      .select(COLLECTION_TIMELINE_PROJECTION)
      .sort({
        "collectionInfo.order": 1,
        _id: 1,
      })
      .lean();
  },

  async findFilmographyByPersonImdbId(personIMDbId, query = {}) {
    if (!personIMDbId) {
      return { items: [], totalItems: 0, page: 1, limit: 20 };
    }

    const normalizedId = String(personIMDbId).trim();

    const filter = {
      $or: [
        { "credits.cast.personIMDbId": normalizedId },
        { "credits.directors.personIMDbId": normalizedId },
        { "credits.writers.personIMDbId": normalizedId },
      ],
    };

    if (query.type) {
      filter.type = query.type;
    }

    const { page, limit, skip } = normalizePagination(query, 20, 50);

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .select({
          ...MEDIA_LIST_PROJECTION,
          credits: 1,
        })
        .sort({
          releaseYear: -1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },
};
