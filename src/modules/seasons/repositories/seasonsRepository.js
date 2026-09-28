import { Season } from "../models/Seasons.js";

export const seasonsRepository = {
  async findByMediaImdbId(mediaImdbId) {
    return Season.find({ mediaImdbId }).sort({ seasonNumber: 1 }).lean();
  },

  async findOne(mediaImdbId, seasonNumber) {
    return Season.findOne({ mediaImdbId, seasonNumber }).lean();
  },
};
