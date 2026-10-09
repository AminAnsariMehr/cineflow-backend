import { collectionService } from "../services/collectionService.js";

export const collectionController = {
  async createCollection(req, res, next) {
    try {
      const data = await collectionService.createCollection(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateCollection(req, res, next) {
    try {
      const data = await collectionService.updateCollection(
        req.params.id,
        req.body,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async deleteCollection(req, res, next) {
    try {
      const data = await collectionService.deleteCollection(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAllCollections(req, res, next) {
    try {
      const { data, pagination } = await collectionService.getAllCollections(
        req.query,
      );
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getCollectionBySlug(req, res, next) {
    try {
      const data = await collectionService.getCollectionBySlug(req.params.slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
