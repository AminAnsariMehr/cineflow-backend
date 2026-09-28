import { getEntityId, toPlainObject } from "#shared/mongoose/entityId.js";

export const toEpisodeDto = (episodeDoc) => {
  const ep = toPlainObject(episodeDoc);
  if (!ep) return null;

  return {
    episodeNumber: ep.episodeNumber,
    title: ep.title ?? { fa: "", en: "" },
    summary: ep.summary ?? { fa: "", en: "" },
    duration: ep.duration ?? null,
    releaseDate: ep.releaseDate ?? null,
    thumbnail: ep.thumbnail ?? "",
    sources: Array.isArray(ep.sources)
      ? ep.sources.map((s) => ({
          quality: s.quality,
          url: s.url,
        }))
      : [],
    isFree: Boolean(ep.isFree),
  };
};

export const toSeasonListDto = (seasonDoc) => {
  const season = toPlainObject(seasonDoc);
  if (!season) return null;

  return {
    id: getEntityId(season),
    mediaImdbId: season.mediaImdbId,
    seasonNumber: season.seasonNumber,
    title: season.title ?? { fa: "", en: "" },
    poster: season.poster ?? "",
    releaseYear: season.releaseYear ?? null,
    episodesCount: Array.isArray(season.episodes) ? season.episodes.length : 0,
  };
};

export const toSeasonDetailsDto = (seasonDoc) => {
  const season = toPlainObject(seasonDoc);
  if (!season) return null;

  return {
    id: getEntityId(season),
    mediaImdbId: season.mediaImdbId,
    seasonNumber: season.seasonNumber,
    title: season.title ?? { fa: "", en: "" },
    poster: season.poster ?? "",
    releaseYear: season.releaseYear ?? null,
    episodesCount: Array.isArray(season.episodes) ? season.episodes.length : 0,
    episodes: Array.isArray(season.episodes)
      ? season.episodes.map(toEpisodeDto).filter(Boolean)
      : [],
    createdAt: season.createdAt ?? null,
    updatedAt: season.updatedAt ?? null,
  };
};
