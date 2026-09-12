import { peopleService } from "../services/peopleService.js";

export const peopleController = {
  async getAllPeople(req, res, next) {
    try {
      const data = await peopleService.getAllPeople(req.query);

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getPersonBySlug(req, res, next) {
    try {
      const data = await peopleService.getPersonBySlug(
        req.params.slug,
        req.query,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};
