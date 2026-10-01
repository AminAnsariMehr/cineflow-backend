import { Media } from "../models/Media.js";
import { normalizePagination } from "../../../shared/utils/pagination.util.js";
import {
  MEDIA_LIST_PROJECTION,
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

    // ۱. فیلتر نوع رسانه
    const cleanType = normalizeString(type);
    if (cleanType && ["movie", "series"].includes(cleanType.toLowerCase())) {
      filter.type = cleanType.toLowerCase();
    }

    // ۲. فیلتر امن ژانر (انگلیسی و فارسی)
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

    // ۳. فیلتر امن زبان
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

    // ۴. فیلترهای بولین
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

    // در صورتی که شرط‌های اور وجود داشته باشند داخل $and قرار می‌گیرند
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // ۵. منطق Sort بر اساس ایندکس‌های دیتابیس
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
