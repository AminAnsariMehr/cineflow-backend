import { mediaService } from "../services/mediaService.js";
import { BadRequestError } from "#shared/errors/AppError.js";

export const mediaController = {
  async getFeaturedSlider(req, res, next) {
    try {
      const rawLimit = req.query.limit;
      let limit = 10;
      if (rawLimit !== undefined) {
        limit = parseInt(rawLimit, 10);
        if (Number.isNaN(limit) || limit < 1) {
          throw new BadRequestError(
            "Query parameter 'limit' must be a positive integer.",
          );
        }
      }

      const data = await mediaService.getFeaturedSlider(limit);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async updateSlider(req, res, next) {
    try {
      const payload = Array.isArray(req.body)
        ? req.body
        : req.body?.mediaIds || req.body?.items || req.body?.ids;

      if (!payload || !Array.isArray(payload)) {
        throw new BadRequestError(
          "Request body must be an array or contain an array field ('items', 'mediaIds', or 'ids').",
        );
      }

      const result = await mediaService.updateSliderItems(payload);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  },

  async getAllMedia(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getAllMedia(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getMediaByIdentifier(req, res, next) {
    try {
      const { identifier } = req.params;
      const media = await mediaService.getMediaByIdentifier(identifier);

      return res.status(200).json({
        success: true,
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTop10(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getTop10(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getTopImdb(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getTopImdb(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getUpcoming(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getUpcoming(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getAnimations(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getAnimations(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getPersianDubbed(req, res, next) {
    try {
      const { data, pagination } = await mediaService.getPersianDubbed(
        req.query,
      );
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
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
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },
};
