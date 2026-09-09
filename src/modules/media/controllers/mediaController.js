import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  getAnimations: async (req, res, next) => {
    try {
      const data = await mediaService.getAnimations();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getPersianDubbed: async (req, res, next) => {
    try {
      const data = await mediaService.getPersianDubbed();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getLatestSeries: async (req, res, next) => {
    try {
      const data = await mediaService.getLatestSeries();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getLatestMovies: async (req, res, next) => {
    try {
      const data = await mediaService.getLatestMovies();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getLatestMedia: async (req, res, next) => {
    try {
      const data = await mediaService.getLatestMedia();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getImdbTop: async (req, res, next) => {
    try {
      const data = await mediaService.getImdbTop();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getAllMedia: async (req, res, next) => {
    try {
      const { type, genre, year, language, sort, limit = 12 } = req.query;
      const data = await mediaService.getAllMedia({
        type,
        genre,
        year,
        language,
        sort,
        limit,
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getMediaBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const data = await mediaService.getMediaBySlug(slug);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
