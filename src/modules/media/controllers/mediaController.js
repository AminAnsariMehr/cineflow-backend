import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  async getAllMedia(req, res, next) {
    try {
      const data = await mediaService.getAllMedia(req.query);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMediaBySlug(req, res, next) {
    try {
      const data = await mediaService.getMediaBySlug(req.params.slug);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTop10Media(req, res, next) {
    try {
      const data = await mediaService.getTop10Media(req.query.limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUpcomingMedia(req, res, next) {
    try {
      const data = await mediaService.getUpcomingMedia(req.query.limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTopImdbMedia(req, res, next) {
    try {
      const data = await mediaService.getTopImdbMedia(req.query.limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAnimations(req, res, next) {
    try {
      const data = await mediaService.getAnimations(req.query.limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPersianDubbed(req, res, next) {
    try {
      const data = await mediaService.getPersianDubbed(req.query.limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
