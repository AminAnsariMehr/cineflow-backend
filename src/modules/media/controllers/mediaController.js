import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  async getFeaturedSlider(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const data = await mediaService.getFeaturedSlider(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateSlider(req, res, next) {
    try {
      const payload = Array.isArray(req.body)
        ? req.body
        : req.body?.mediaIds || req.body?.items || req.body?.ids || [];

      const result = await mediaService.updateSliderItems(payload);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

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

  async getPersonFilmography(req, res, next) {
    try {
      const { personIMDbId } = req.params;
      const { data, pagination } =
        await mediaService.getFilmographyByPersonImdbId(
          personIMDbId,
          req.query,
        );
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },
};
