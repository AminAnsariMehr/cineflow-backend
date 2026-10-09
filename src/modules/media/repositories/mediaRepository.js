import { Media } from "../models/Media.js";
import mongoose from "mongoose";
import { normalizePagination } from "#shared/utils/pagination.util.js";
import {
  MEDIA_LIST_PROJECTION,
  MEDIA_SLIDER_PROJECTION,
  MEDIA_DETAILS_PROJECTION,
  PERSON_SUMMARY_PROJECTION,
  COLLECTION_TIMELINE_PROJECTION,
  COLLECTION_SUMMARY_PROJECTION,
} from "./media.projections.js";

const normalizeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseBoolean = (val) =>
  val === true || val === "true" || val === 1 || val === "1";

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
    if (!Array.isArray(items) || !items.length) {
      return { matchedCount: 0, modifiedCount: 0, count: 0 };
    }

    const operations = items.map((item, index) => {
      const rawId =
        typeof item === "object" && item !== null
          ? item.id || item._id || item.imdbId
          : item;

      const order =
        typeof item === "object" && item?.order !== undefined
          ? Number(item.order)
          : index + 1;

      const idStr = String(rawId || "").trim();
      const isMongoId = mongoose.Types.ObjectId.isValid(idStr);

      const filter = isMongoId
        ? { _id: new mongoose.Types.ObjectId(idStr) }
        : { imdbId: idStr.toLowerCase() };

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              isFeatured: true,
              featuredOrder: Number.isInteger(order) ? order : index + 1,
            },
          },
        },
      };
    });

    const session = await mongoose.startSession();
    try {
      let bulkResult;
      await session.withTransaction(async () => {
        await Media.updateMany(
          { isFeatured: true },
          { $set: { isFeatured: false, featuredOrder: 0 } },
          { session },
        );

        bulkResult = await Media.bulkWrite(operations, { session });
      });

      return {
        matchedCount: bulkResult.matchedCount,
        modifiedCount: bulkResult.modifiedCount,
        count: bulkResult.modifiedCount,
      };
    } finally {
      await session.endSession();
    }
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

    const cleanType = normalizeString(type);
    if (cleanType && ["movie", "series"].includes(cleanType.toLowerCase())) {
      filter.type = cleanType.toLowerCase();
    }

    const cleanGenre = normalizeString(genre);
    if (cleanGenre) {
      filter.$or = [{ "genres.en": cleanGenre }, { "genres.fa": cleanGenre }];
    }

    const cleanLanguage = normalizeString(language);
    if (cleanLanguage) {
      const langFilter = [
        { "languages.en": cleanLanguage },
        { "languages.fa": cleanLanguage },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: langFilter }];
        delete filter.$or;
      } else {
        filter.$or = langFilter;
      }
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

  async findByIdentifier(identifier) {
    const isImdbId = /^tt\d{7,8}$/i.test(identifier);

    const query = isImdbId
      ? { imdbId: identifier.toLowerCase() }
      : {
          $or: [
            { slug: identifier.toLowerCase() },
            { imdbId: identifier.toLowerCase() },
          ],
        };

    // return await Media.findOne(query)
    //   .populate({
    //     path: "credits.cast.person",
    //     select: "slug name avatar",
    //   })
    //   .populate({
    //     path: "credits.directors.person",
    //     select: "slug name avatar",
    //   })
    //   .populate({
    //     path: "credits.writers.person",
    //     select: "slug name avatar",
    //   })
    //   .populate({
    //     path: "credits.crew.person",
    //     select: "slug name avatar",
    //   })
    //   .populate({
    //     path: "collections.collectionRef",
    //     select: "slug title assets",
    //   })
    //   .lean();

    const media = await Media.findOne(query)
      .populate({
        path: "credits.cast.person",
        select: "imdbId slug name avatar",
      })
      .populate({
        path: "credits.directors.person",
        select: "imdbId slug name avatar",
      })
      .populate({
        path: "credits.writers.person",
        select: "imdbId slug name avatar",
      })
      .populate({
        path: "credits.crew.person",
        select: "imdbId slug name avatar",
      })
      .populate({
        path: "collections.collectionRef",
        select: "slug title assets",
      })
      .lean();

    return media;
  },

  async findCollectionTimeline(collectionId) {
    if (!collectionId || !mongoose.isValidObjectId(collectionId)) return [];

    return Media.find({
      "collections.collectionRef": new mongoose.Types.ObjectId(collectionId),
    })
      .select(COLLECTION_TIMELINE_PROJECTION)
      .sort({
        "collections.order": 1,
        releaseYear: 1,
        _id: 1,
      })
      .lean();
  },

  async findFilmographyByPersonImdbId(personIMDbId, query = {}) {
    if (!personIMDbId) {
      return { items: [], totalItems: 0, page: 1, limit: 20 };
    }

    const normalizedId = String(personIMDbId).trim().toLowerCase();

    const filter = {
      $or: [
        { "credits.cast.personIMDbId": normalizedId },
        { "credits.directors.personIMDbId": normalizedId },
        { "credits.writers.personIMDbId": normalizedId },
        { "credits.crew.personIMDbId": normalizedId },
      ],
    };

    if (
      query.type &&
      ["movie", "series"].includes(String(query.type).toLowerCase())
    ) {
      filter.type = String(query.type).toLowerCase();
    }

    const { page, limit, skip } = normalizePagination(query, 20, 100);

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

  async findFilmographyByPersonObjectId(personObjectId, query = {}) {
    if (!personObjectId || !mongoose.isValidObjectId(personObjectId)) {
      return { items: [], totalItems: 0, page: 1, limit: 20 };
    }

    const pId = new mongoose.Types.ObjectId(personObjectId);
    const filter = {
      $or: [
        { "credits.cast.person": pId },
        { "credits.directors.person": pId },
        { "credits.writers.person": pId },
        { "credits.crew.person": pId },
      ],
    };

    if (
      query.type &&
      ["movie", "series"].includes(String(query.type).toLowerCase())
    ) {
      filter.type = String(query.type).toLowerCase();
    }

    const { page, limit, skip } = normalizePagination(query, 20, 100);

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
