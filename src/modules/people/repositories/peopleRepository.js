import Actor from "../models/Actor.js";

export const actorsRepository = {
  async findAll({ limit = 50 } = {}) {
    return Actor.find().sort({ "name.en": 1 }).limit(limit).lean();
  },
};
