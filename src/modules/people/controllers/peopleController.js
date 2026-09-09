import { actorsService } from "../services/actorsService.js";

export const actorsController = {
  getAllActors: async (req, res, next) => {
    try {
      const data = await actorsService.getAllActors();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
