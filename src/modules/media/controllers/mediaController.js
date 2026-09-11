import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  async getAllMedia(req, res, next) {
    try {
      const data = await mediaService.getAllMedia(req.query);
      res.json({ success: true, count: data.length, data });
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
      const data = await mediaService.getTop10(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  },

  async getTopImdb(req, res, next) {
    try {
      const data = await mediaService.getTopImdb(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  },

  async getUpcoming(req, res, next) {
    try {
      const data = await mediaService.getUpcoming(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  },

  async getAnimations(req, res, next) {
    try {
      const data = await mediaService.getAnimations(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  },

  async getPersianDubbed(req, res, next) {
    try {
      const data = await mediaService.getPersianDubbed(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  },

  // async getMediaBySlug(req, res) {
  //   const { slug } = req.params;

  //   const media = await Media.findOne({ slug })
  //     .populate("credits.directors credits.writers credits.cast.person")
  //     .populate("collectionInfo.collection");

  //   if (!media) return res.status(404).json({ message: "Media not found" });

  //   let collectionTimeline = [];

  //   if (media.collectionInfo?.collection) {
  //     collectionTimeline = await Media.find({
  //       "collectionInfo.collection": media.collectionInfo.collection._id,
  //     })
  //       .select(
  //         "id slug title releaseYear assets.poster collectionInfo.order type",
  //       )
  //       .sort({ "collectionInfo.order": 1 });
  //   }

  //   res.json({
  //     ...media.toJSON(),
  //     collectionTimeline,
  //   });
  // },
};
