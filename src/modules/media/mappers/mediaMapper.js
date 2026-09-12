/* -----------------------------------------------------------------------------
 * Helpers & Utilities
 * -----------------------------------------------------------------------------*/

// تبدیل امن Mongoose Document یا ورودی خام به Plain Object
const toPlainObject = (doc) => {
  if (!doc || typeof doc !== "object") return null;
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
};

// استخراج و تبدیل ایمن Mongo ObjectId یا شناسه به رشته
const getEntityId = (entity) => {
  if (!entity || typeof entity !== "object") return null;
  const rawId = entity.id ?? entity._id;
  if (rawId == null) return null;
  return typeof rawId.toString === "function"
    ? rawId.toString()
    : String(rawId);
};

// دریافت بهینه و پایدار پوستر
const getPosterUrl = (assets) => {
  if (!assets || typeof assets !== "object") return null;
  return assets.poster?.vertical || assets.poster || null;
};

/*-----------------------------------------------------------------------------
 * Sub-DTO Mappers
 * -----------------------------------------------------------------------------*/

export const toPersonSummaryDto = (person) => {
  const source = toPlainObject(person);
  if (!source) return null;

  const id = getEntityId(source);
  const slug = source.slug ?? null;

  if (!id && !slug) return null;

  return {
    id,
    slug,
    name: source.name ?? null,
    avatar: source.avatar ?? null,
  };
};

export const toCollectionDto = (collection) => {
  const source = toPlainObject(collection);
  if (!source) return null;

  const id = getEntityId(source);
  const slug = source.slug ?? null;

  if (!id && !slug) return null;

  return {
    id,
    slug,
    title: source.title ?? null,
    summary: source.summary ?? null,
    assets: source.assets ?? null,
  };
};

export const toCollectionTimelineItemDto = (item) => {
  const source = toPlainObject(item);
  if (!source) return null;

  const id = getEntityId(source);
  if (!id && !source.slug) return null;

  return {
    id,
    slug: source.slug ?? null,
    title: source.title ?? null,
    releaseYear: source.releaseYear ?? null,
    type: source.type ?? null,
    poster: getPosterUrl(source.assets),
    collectionOrder: source.collectionInfo?.order ?? null,
  };
};

const toMediaBaseDto = (source) => ({
  id: getEntityId(source),
  slug: source.slug ?? null,
  type: source.type ?? null,
  title: source.title ?? null,
  originalTitle: source.originalTitle ?? null,
  releaseYear: source.releaseYear ?? null,
  ageRating: source.ageRating ?? null,
  duration: source.type === "movie" ? (source.duration ?? null) : null,
  genres: Array.isArray(source.genres) ? source.genres : [],
  countries: Array.isArray(source.countries) ? source.countries : [],
  languages: Array.isArray(source.languages) ? source.languages : [],
  assets: source.assets ?? null,
  poster: getPosterUrl(source.assets),
  rating: source.rating ?? null,
  seriesDetails:
    source.type === "series" ? (source.seriesDetails ?? null) : null,
  isTop10: Boolean(source.isTop10),
  isUpcoming: Boolean(source.isUpcoming),
  isExclusive: Boolean(source.isExclusive),
});

/*-----------------------------------------------------------------------------
 * Main DTOs
 * -----------------------------------------------------------------------------*/

export const toMediaListDto = (doc) => {
  const source = toPlainObject(doc);
  if (!source) return null;

  return toMediaBaseDto(source);
};

export const toMediaDetailsDto = (doc, rawTimeline = []) => {
  const source = toPlainObject(doc);
  if (!source) return null;

  // Credits Mapping
  const cast = Array.isArray(source.credits?.cast)
    ? source.credits.cast
        .map((item) => {
          const person = toPersonSummaryDto(item?.person);
          if (!person) return null;

          return {
            character: item.character ?? null,
            order: item.order ?? null,
            person,
          };
        })
        .filter(Boolean)
    : [];

  const directors = Array.isArray(source.credits?.directors)
    ? source.credits.directors.map(toPersonSummaryDto).filter(Boolean)
    : [];

  const writers = Array.isArray(source.credits?.writers)
    ? source.credits.writers.map(toPersonSummaryDto).filter(Boolean)
    : [];

  const collectionInfo = source.collectionInfo
    ? {
        collection: toCollectionDto(source.collectionInfo.collection),
        order: source.collectionInfo.order ?? null,
      }
    : null;

  const collectionTimeline = Array.isArray(rawTimeline)
    ? rawTimeline.map(toCollectionTimelineItemDto).filter(Boolean)
    : [];

  return {
    ...toMediaBaseDto(source),
    summary: source.summary ?? null,
    credits: {
      cast,
      directors,
      writers,
    },
    collectionInfo,
    collectionTimeline,
    createdAt: source.createdAt ?? null,
    updatedAt: source.updatedAt ?? null,
  };
};
