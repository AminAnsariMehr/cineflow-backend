import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  async getAllMedia(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getAllMedia(req.query);
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getMediaBySlug(req, res, next) {
    try {
      const data = await mediaService.getMediaBySlug(req.params.slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getTop10(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getTop10(req.query);
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getTopImdb(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getTopImdb(req.query);
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getUpcoming(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getUpcoming(req.query);
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getAnimations(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getAnimations(req.query);
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getPersianDubbed(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getPersianDubbed(
        req.query,
      );
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },
};
