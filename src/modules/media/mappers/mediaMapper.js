import { getEntityId, toPlainObject } from "#shared/mongoose/entityId.js";

const getPosterUrl = (assets) =>
  assets?.poster?.vertical ?? assets?.poster?.horizontal ?? null;

export const toPersonSummaryDto = (person) => {
  const source = toPlainObject(person);
  if (!source) return null;

  return {
    imdbId: source.imdbId ?? null,
    slug: source.slug ?? null,
    name: {
      en: source.name?.en ?? source.en ?? "",
      fa: source.name?.fa ?? source.fa ?? "",
    },
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

export const toCollectionTimelineItemDto = (
  mediaDoc,
  targetCollectionId = null,
) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  let order = null;
  if (targetCollectionId && Array.isArray(media.collections)) {
    const matched = media.collections.find((c) => {
      const colId = c.collectionRef?._id ?? c.collectionRef;
      return String(colId) === String(targetCollectionId);
    });
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
    imdbId: media.imdbId ?? null,
    slug: media.slug ?? null,
    type: media.type ?? null,
    title: media.title ?? { fa: "", en: "" },
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    duration: media.type === "movie" ? (media.duration ?? null) : null,
    genres: media.genres ?? { en: [], fa: [] },
    countries: media.countries ?? { en: [], fa: [] },
    languages: media.languages ?? { en: [], fa: [] },
    assets: media.assets ?? {},
    poster: getPosterUrl(media.assets),
    rating: media.rating ?? null,
    seriesDetails:
      media.type === "series" ? (media.seriesDetails ?? null) : null,
    isTop10: Boolean(media.isTop10),
    isUpcoming: Boolean(media.isUpcoming),
    isExclusive: Boolean(media.isExclusive),
    hasPersianDub: Boolean(media.hasPersianDub),
  };
};

export const toMediaDetailsDto = (mediaDoc, collectionTimelines = {}) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  const cast = Array.isArray(media.credits?.cast)
    ? media.credits.cast
        .map((item) => {
          const person = item.person ? toPersonSummaryDto(item.person) : null;
          return {
            character: item.character ?? { fa: "", en: "" },
            person,
            order: item.order ?? 0,
          };
        })
        .filter(Boolean)
    : [];

  const directors = Array.isArray(media.credits?.directors)
    ? media.credits.directors
        .map((item) => {
          if (item.person) {
            return toPersonSummaryDto(item.person);
          }
          return {
            imdbId: item.personIMDbId ?? null,
            slug: null,
            name: {
              en: item.name?.en ?? item.en ?? "",
              fa: item.name?.fa ?? item.fa ?? "",
            },
            avatar: null,
          };
        })
        .filter(Boolean)
    : [];

  const writers = Array.isArray(media.credits?.writers)
    ? media.credits.writers
        .map((item) => {
          if (item.person) {
            return toPersonSummaryDto(item.person);
          }
          return {
            imdbId: item.personIMDbId ?? null,
            slug: null,
            name: {
              en: item.name?.en ?? item.en ?? "",
              fa: item.name?.fa ?? item.fa ?? "",
            },
            avatar: null,
          };
        })
        .filter(Boolean)
    : [];

  const crew = Array.isArray(media.credits?.crew)
    ? media.credits.crew.map((item) => ({
        job: item.job ?? "",
        department: item.department ?? "",
        person: item.person ? toPersonSummaryDto(item.person) : null,
      }))
    : [];

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
    imdbId: media.imdbId ?? null,
    slug: media.slug ?? null,
    type: media.type ?? null,
    title: media.title ?? { fa: "", en: "" },
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    duration: media.type === "movie" ? (media.duration ?? null) : null,
    summary: media.summary ?? { fa: "", en: "" },
    genres: media.genres ?? { en: [], fa: [] },
    countries: media.countries ?? { en: [], fa: [] },
    languages: media.languages ?? { en: [], fa: [] },
    assets: media.assets ?? {},
    poster: getPosterUrl(media.assets),
    rating: media.rating ?? null,
    seriesDetails:
      media.type === "series" ? (media.seriesDetails ?? null) : null,
    credits: { cast, directors, writers, crew },
    collections,
    createdAt: media.createdAt ?? null,
    updatedAt: media.updatedAt ?? null,
    isTop10: Boolean(media.isTop10),
    isUpcoming: Boolean(media.isUpcoming),
    isExclusive: Boolean(media.isExclusive),
    hasPersianDub: Boolean(media.hasPersianDub),
  };
};

export const toMediaSliderDto = (mediaDoc) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  console.log(media.countries);

  return {
    id: getEntityId(media),
    imdbId: media.imdbId ?? null,
    slug: media.slug ?? null,
    title: media.title ?? { fa: "", en: "" },
    releaseYear: media.releaseYear ?? null,
    ageRating: media.ageRating ?? null,
    poster: media.assets.poster ?? {},
    countries: media.countries,
    rating: media.rating,
    isExclusive: Boolean(media.isExclusive),
    order: media.featuredOrder ?? 0,
  };
};
