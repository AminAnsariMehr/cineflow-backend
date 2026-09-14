import { getEntityId, toPlainObject } from "#shared/mongoose/entityId";

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

export const toCollectionTimelineItemDto = (mediaDoc) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  return {
    id: getEntityId(media),
    slug: media.slug ?? null,
    title: media.title ?? { fa: "", en: "" },
    releaseYear: media.releaseYear ?? null,
    type: media.type ?? null,
    poster: getPosterUrl(media.assets),
    order: media.collectionInfo?.order ?? null,
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

export const toMediaDetailsDto = (mediaDoc, options = {}) => {
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

  const directors = Array.isArray(media.credits?.directors)
    ? media.credits.directors.map(toPersonSummaryDto).filter(Boolean)
    : [];

  const writers = Array.isArray(media.credits?.writers)
    ? media.credits.writers.map(toPersonSummaryDto).filter(Boolean)
    : [];

  const collectionInfo = media.collectionInfo
    ? {
        collection: toCollectionDto(media.collectionInfo.collection),
        order: media.collectionInfo.order ?? null,
      }
    : null;

  const rawTimeline = Array.isArray(options)
    ? options
    : (options.collectionTimeline ?? []);

  const collectionTimeline = Array.isArray(rawTimeline)
    ? rawTimeline.map(toCollectionTimelineItemDto).filter(Boolean)
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
    },
    collectionInfo,
    collectionTimeline,
    createdAt: media.createdAt ?? null,
    updatedAt: media.updatedAt ?? null,
    isTop10: Boolean(media.isTop10),
    isUpcoming: Boolean(media.isUpcoming),
    isExclusive: Boolean(media.isExclusive),
  };
};
