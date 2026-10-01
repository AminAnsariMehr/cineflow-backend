import { getEntityId, toPlainObject } from "#shared/mongoose/entityId.js";

const getPosterUrl = (assets) =>
  assets?.poster?.vertical ?? assets?.poster?.horizontal ?? null;

export const toPersonSummaryDto = (person) => {
  const source = toPlainObject(person);
  if (!source) return null;

  return {
    id: getEntityId(source),
    slug: source.slug ?? null,
    name: source.name ?? { fa: "", en: "" },
    avatar: source.avatar ?? null,
  };
};

export const toCollectionDto = (collection) => {
  const source = toPlainObject(collection);
  if (!source) return null;

  return {
    id: getEntityId(source),
    slug: source.slug ?? null,
    title: source.title ?? { fa: "", en: "" },
    summary: source.summary ?? { fa: "", en: "" },
    poster: getPosterUrl(source.assets),
  };
};

export const toCollectionTimelineItemDto = (mediaDoc, collectionId = null) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  let order = null;
  if (collectionId && Array.isArray(media.collections)) {
    const matched = media.collections.find(
      (c) =>
        String(c.collectionRef?._id || c.collectionRef) ===
        String(collectionId),
    );
    if (matched) order = matched.order;
  }

  return {
    id: getEntityId(media),
    slug: media.slug ?? null,
    title: media.title ?? { fa: "", en: "" },
    releaseYear: media.releaseYear ?? null,
    type: media.type ?? null,
    poster: getPosterUrl(media.assets),
    order,
  };
};

export const toMediaListDto = (mediaDoc) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  return {
    id: getEntityId(media),
    slug: media.slug ?? null,
    type: media.type ?? null,
    title: media.title ?? { fa: "", en: "" },
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    duration: media.type === "movie" ? (media.duration ?? null) : null,
    genres: Array.isArray(media.genres) ? media.genres : [],
    countries: Array.isArray(media.countries) ? media.countries : [],
    languages: Array.isArray(media.languages) ? media.languages : [],
    assets: media.assets ?? {},
    poster: getPosterUrl(media.assets),
    rating: media.rating ?? null,
    seriesDetails:
      media.type === "series" ? (media.seriesDetails ?? null) : null,
    isTop10: Boolean(media.isTop10),
    isUpcoming: Boolean(media.isUpcoming),
    isExclusive: Boolean(media.isExclusive),
  };
};

export const toMediaDetailsDto = (mediaDoc, collectionTimelines = {}) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  const cast = Array.isArray(media.credits?.cast)
    ? media.credits.cast
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

  // کارگردان‌ها فقط شامل نام رشته‌ای
  const directors = Array.isArray(media.credits?.directors)
    ? media.credits.directors
    : [];

  // نویسنده‌ها فقط شامل نام رشته‌ای
  const writers = Array.isArray(media.credits?.writers)
    ? media.credits.writers
    : [];

  // سایر عوامل به صورت { role, name }
  const crew = Array.isArray(media.credits?.crew) ? media.credits.crew : [];

  const collections = Array.isArray(media.collections)
    ? media.collections
        .map((colItem) => {
          const colDto = toCollectionDto(colItem.collectionRef);
          if (!colDto) return null;
          const timelineRaw = collectionTimelines[colDto.id] || [];
          return {
            collection: colDto,
            order: colItem.order ?? null,
            timeline: timelineRaw
              .map((item) => toCollectionTimelineItemDto(item, colDto.id))
              .filter(Boolean),
          };
        })
        .filter(Boolean)
    : [];

  return {
    id: getEntityId(media),
    slug: media.slug ?? null,
    type: media.type ?? null,
    title: media.title ?? { fa: "", en: "" },
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    duration: media.type === "movie" ? (media.duration ?? null) : null,
    summary: media.summary ?? { fa: "", en: "" },
    genres: Array.isArray(media.genres) ? media.genres : [],
    countries: Array.isArray(media.countries) ? media.countries : [],
    languages: Array.isArray(media.languages) ? media.languages : [],
    assets: media.assets ?? {},
    poster: getPosterUrl(media.assets),
    rating: media.rating ?? null,
    seriesDetails:
      media.type === "series" ? (media.seriesDetails ?? null) : null,
    credits: {
      cast,
      directors,
      writers,
      crew,
    },
    collections,
    createdAt: media.createdAt ?? null,
    updatedAt: media.updatedAt ?? null,
    isTop10: Boolean(media.isTop10),
    isUpcoming: Boolean(media.isUpcoming),
    isExclusive: Boolean(media.isExclusive),
  };
};

// export const toMediaSliderDto = (mediaDoc) => {
//   const media = toPlainObject(mediaDoc);
//   if (!media) return null;

//   return {
//     id: getEntityId(media),
//     slug: media.slug ?? null,
//     type: media.type ?? null,
//     title: media.title ?? { fa: "", en: "" },
//     originalTitle: media.originalTitle ?? "",
//     summary: media.summary ?? { fa: "", en: "" },
//     releaseYear: media.releaseYear ?? null,
//     ageRating: media.ageRating ?? null,
//     duration: media.type === "movie" ? (media.duration ?? null) : null,
//     genres: Array.isArray(media.genres) ? media.genres : [],
//     poster: {
//       vertical: media.assets?.poster?.vertical ?? null,
//       horizontal: media.assets?.poster?.horizontal ?? null,
//       backdrop: media.assets?.poster?.backdrop ?? null,
//     },
//     rating: {
//       imdb: media.rating?.imdb ?? null,
//       userRating: media.rating?.userRating ?? 0,
//     },
//     isExclusive: Boolean(media.isExclusive),
//     order: media.featuredOrder ?? 0,
//   };
// };

export const toMediaSliderDto = (mediaDoc) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  return {
    id: getEntityId(media),
    slug: media.slug ?? null,
    imdbId: media.imdbId ?? null,
    type: media.type ?? null,
    title: media.title ?? { fa: "", en: "" },
    originalTitle: media.originalTitle ?? "",
    summary: media.summary ?? { fa: "", en: "" },
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    duration: media.type === "movie" ? (media.duration ?? null) : null,
    genres: Array.isArray(media.genres) ? media.genres : [],
    // فیلد اصلی استاتیک هماهنگ با بقیه کنترلرها
    assets: media.assets ?? {},
    poster: getPosterUrl(media.assets),
    // تصاویر اختصاصی اسلایدر با اولویت افقی/بک‌دراپ
    sliderImages: {
      vertical: media.assets?.poster?.vertical ?? null,
      horizontal: media.assets?.poster?.horizontal ?? null,
      backdrop: media.assets?.poster?.backdrop ?? null,
    },
    rating: {
      imdb: media.rating?.imdb ?? null,
      userRating: media.rating?.userRating ?? 0,
    },
    isExclusive: Boolean(media.isExclusive),
    order: media.featuredOrder ?? 0,
  };
};
