import { seasonsRepository } from "../repositories/seasonsRepository.js";
import { NotFoundError, BadRequestError } from "#shared/errors/AppError.js";
import {
  toSeasonListDto,
  toSeasonDetailsDto,
  toEpisodeDto,
} from "../mappers/seasonsMapper.js";

const IMDB_ID_REGEX = /^tt\d+$/;

const validateImdbId = (id) => {
  if (!id || typeof id !== "string" || !IMDB_ID_REGEX.test(id.trim())) {
    throw new BadRequestError(
      "Valid media IMDb ID is required (e.g., tt0903747)",
    );
  }
  return id.trim();
};

export const seasonsService = {
  async getSeasonsByMediaImdbId(rawMediaImdbId, includeEpisodes = false) {
    const mediaImdbId = validateImdbId(rawMediaImdbId);
    const seasons = await seasonsRepository.findByMediaImdbId(
      mediaImdbId,
      includeEpisodes,
    );

    return seasons.map(includeEpisodes ? toSeasonDetailsDto : toSeasonListDto);
  },

  async getSeasonByNumber(rawMediaImdbId, rawSeasonNumber) {
    const mediaImdbId = validateImdbId(rawMediaImdbId);
    const seasonNumber = Number(rawSeasonNumber);

    if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
      throw new BadRequestError("Season number must be a positive integer");
    }

    const season = await seasonsRepository.findByMediaAndSeasonNumber(
      mediaImdbId,
      seasonNumber,
    );

    if (!season) {
      throw new NotFoundError(
        `Season ${seasonNumber} for media '${mediaImdbId}' not found`,
      );
    }

    return toSeasonDetailsDto(season);
  },

  async getSeasonById(id) {
    if (!id) {
      throw new BadRequestError("Season ID is required");
    }

    const season = await seasonsRepository.findById(id);
    if (!season) {
      throw new NotFoundError(`Season with ID '${id}' not found`);
    }

    return toSeasonDetailsDto(season);
  },

  async getEpisode(rawMediaImdbId, rawSeasonNumber, rawEpisodeNumber) {
    const mediaImdbId = validateImdbId(rawMediaImdbId);
    const seasonNumber = Number(rawSeasonNumber);
    const episodeNumber = Number(rawEpisodeNumber);

    if (
      !Number.isInteger(seasonNumber) ||
      seasonNumber < 1 ||
      !Number.isInteger(episodeNumber) ||
      episodeNumber < 1
    ) {
      throw new BadRequestError(
        "Season number and episode number must be positive integers",
      );
    }

    const result = await seasonsRepository.findEpisode(
      mediaImdbId,
      seasonNumber,
      episodeNumber,
    );

    if (!result) {
      throw new NotFoundError(
        `Episode ${episodeNumber} of season ${seasonNumber} for media '${mediaImdbId}' not found`,
      );
    }

    return {
      mediaImdbId: result.mediaImdbId,
      seasonNumber: result.seasonNumber,
      seasonTitle: result.seasonTitle,
      episode: toEpisodeDto(result.episode),
    };
  },
};
