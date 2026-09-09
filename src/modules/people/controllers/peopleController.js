import { peopleService } from "../services/peopleService.js";

export const peopleController = {
  async getAllPeople(req, res, next) {
    try {
      const data = await peopleService.getAllPeople(req.query);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPersonBySlug(req, res, next) {
    try {
      const data = await peopleService.getPersonBySlug(req.params.slug);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
