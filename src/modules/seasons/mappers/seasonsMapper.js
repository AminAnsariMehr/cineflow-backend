import { toPlainObject } from "#shared/mongoose/entityId.js";

export const toSeasonDto = (seasonDoc) => {
  const season = toPlainObject(seasonDoc);
  if (!season) return null;

  return {
    id: season._id,
    mediaImdbId: season.mediaImdbId,
    seasonNumber: season.seasonNumber,
    title: season.title,
    poster: season.poster,
    releaseYear: season.releaseYear,
    episodesCount: season.episodes?.length ?? 0,

    episodes:
      season.episodes?.map((ep) => ({
        ...ep,
        id: undefined,
      })) ?? [],
  };
};

export const toSeasonSummaryDto = (seasonDoc) => {
  const season = toPlainObject(seasonDoc);
  if (!season) return null;

  return {
    seasonNumber: season.seasonNumber,
    title: season.title,
    poster: season.poster,
  };
};
