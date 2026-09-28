import { seasonsService } from "../services/seasonsService.js";

export const seasonsController = {
  async getSeasons(req, res, next) {
    try {
      const { imdbId } = req.params;
      const data = await seasonsService.getSeasonsByMedia(imdbId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSeasonDetails(req, res, next) {
    try {
      const { imdbId, seasonNumber } = req.params;
      const data = await seasonsService.getSeasonDetails(imdbId, seasonNumber);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
