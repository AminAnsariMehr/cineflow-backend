import { seasonsService } from "../services/seasonsService.js";

export const seasonsController = {
  async getSeasonsByMedia(req, res, next) {
    try {
      const { mediaImdbId } = req.params;
      const includeEpisodes = req.query.includeEpisodes === "true";
      const data = await seasonsService.getSeasonsByMediaImdbId(
        mediaImdbId,
        includeEpisodes,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSeasonByNumber(req, res, next) {
    try {
      const { mediaImdbId, seasonNumber } = req.params;
      const data = await seasonsService.getSeasonByNumber(
        mediaImdbId,
        seasonNumber,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSeasonById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await seasonsService.getSeasonById(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getEpisode(req, res, next) {
    try {
      const { mediaImdbId, seasonNumber, episodeNumber } = req.params;
      const data = await seasonsService.getEpisode(
        mediaImdbId,
        seasonNumber,
        episodeNumber,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
