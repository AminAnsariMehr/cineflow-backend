import { Season } from "../models/Seasons.js";

export const SEASON_LIST_PROJECTION = {
  _id: 1,
  mediaImdbId: 1,
  seasonNumber: 1,
  title: 1,
  poster: 1,
  releaseYear: 1,
  episodes: {
    episodeNumber: 1,
  },
};

export const SEASON_DETAILS_PROJECTION = {
  _id: 1,
  mediaImdbId: 1,
  seasonNumber: 1,
  title: 1,
  poster: 1,
  releaseYear: 1,
  episodes: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const seasonsRepository = {
  async findByMediaImdbId(mediaImdbId, includeEpisodes = false) {
    const projection = includeEpisodes
      ? SEASON_DETAILS_PROJECTION
      : SEASON_LIST_PROJECTION;

    return Season.find({ mediaImdbId })
      .select(projection)
      .sort({ seasonNumber: 1 })
      .lean();
  },

  async findByMediaAndSeasonNumber(mediaImdbId, seasonNumber) {
    return Season.findOne({
      mediaImdbId,
      seasonNumber: Number(seasonNumber),
    })
      .select(SEASON_DETAILS_PROJECTION)
      .lean();
  },

  async findById(id) {
    return Season.findById(id).select(SEASON_DETAILS_PROJECTION).lean();
  },

  async findEpisode(mediaImdbId, seasonNumber, episodeNumber) {
    const season = await Season.findOne(
      {
        mediaImdbId,
        seasonNumber: Number(seasonNumber),
        "episodes.episodeNumber": Number(episodeNumber),
      },
      {
        _id: 1,
        mediaImdbId: 1,
        seasonNumber: 1,
        title: 1,
        "episodes.$": 1,
      },
    ).lean();

    if (!season || !season.episodes || season.episodes.length === 0) {
      return null;
    }

    return {
      seasonId: season._id,
      mediaImdbId: season.mediaImdbId,
      seasonNumber: season.seasonNumber,
      seasonTitle: season.title,
      episode: season.episodes[0],
    };
  },
};
