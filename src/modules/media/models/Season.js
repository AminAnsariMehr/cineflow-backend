import mongoose from "mongoose";

const cleanSeasonTransform = (_, ret) => {
  delete ret.__v;
  return ret;
};

const episodeSchema = new mongoose.Schema(
  {
    episodeNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, default: "", trim: true },
    },
    summary: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },

    sources: [
      {
        quality: { type: String, enum: ["480p", "720p", "1080p", "2k", "4k"] },
        url: { type: String, required: true },
      },
    ],
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const seasonSchema = new mongoose.Schema(
  {
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: true,
      index: true,
    },
    seasonNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      fa: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    poster: {
      type: String,
      default: "",
    },
    releaseYear: {
      type: Number,
    },
    episodes: {
      type: [episodeSchema],
      default: [],
      validate: {
        validator: function (episodes) {
          if (!episodes || episodes.length === 0) return true;
          const epNumbers = episodes.map((e) => e.episodeNumber);
          return new Set(epNumbers).size === epNumbers.length;
        },
        message: "Episode numbers within a season must be unique.",
      },
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      virtuals: true,
      transform: cleanSeasonTransform,
    },
    toObject: {
      virtuals: true,
      transform: cleanSeasonTransform,
    },
  },
);

seasonSchema.index({ mediaId: 1, seasonNumber: 1 }, { unique: true });

export const Season = mongoose.model("Season", seasonSchema);
