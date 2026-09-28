import { seasonsRepository } from "../repositories/seasonsRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { toSeasonDto, toSeasonSummaryDto } from "../mappers/seasonsMapper.js";

export const seasonsService = {
  async getSeasonsByMedia(imdbId) {
    const seasons = await seasonsRepository.findByMediaImdbId(imdbId);
    return seasons.map(toSeasonSummaryDto);
  },

  async getSeasonDetails(imdbId, seasonNumber) {
    const season = await seasonsRepository.findOne(
      imdbId,
      parseInt(seasonNumber),
    );
    if (!season) {
      throw new NotFoundError(
        `Season ${seasonNumber} for media ${imdbId} not found`,
      );
    }
    return toSeasonDto(season);
  },
};
