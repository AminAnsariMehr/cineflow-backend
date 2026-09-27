import mongoose from "mongoose";

const cleanSeasonTransform = (_, ret) => {
  delete ret.__v;
  return ret;
};

const localizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true, default: "" },
    en: { type: String, trim: true, default: "" },
  },
  { _id: false, autoIndex: false },
);

const sourceSchema = new mongoose.Schema(
  {
    quality: {
      type: String,
      enum: ["480p", "720p", "1080p", "1440p", "2160p"],
      required: true,
      trim: true,
    },
    url: { type: String, required: true, trim: true },
  },
  { _id: false, autoIndex: false },
);

const episodeSchema = new mongoose.Schema(
  {
    episodeNumber: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Episode number must be an integer",
      },
    },
    title: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    summary: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Episode duration must be an integer representing minutes",
      },
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    thumbnail: { type: String, trim: true, default: "" },
    sources: { type: [sourceSchema], default: [] },
    isFree: { type: Boolean, default: false },
  },
  { _id: false, autoIndex: false },
);

const seasonSchema = new mongoose.Schema(
  {
    mediaImdbId: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^tt\d+$/,
        "Invalid mediaImdbId format (expected tt followed by digits)",
      ],
    },
    seasonNumber: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "seasonNumber must be an integer",
      },
    },
    title: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    poster: { type: String, trim: true, default: "" },
    releaseYear: {
      type: Number,
      default: null,
      validate: {
        validator: (v) => v === null || (Number.isInteger(v) && v >= 1888),
        message: "releaseYear must be a valid integer year >= 1888 or null",
      },
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
    autoIndex: false,
    toJSON: { virtuals: true, transform: cleanSeasonTransform },
    toObject: { virtuals: true, transform: cleanSeasonTransform },
  },
);

seasonSchema.index(
  { mediaImdbId: 1, seasonNumber: 1 },
  { unique: true, name: "uniq_media_season" },
);

seasonSchema.index({ mediaImdbId: 1 }, { name: "idx_mediaImdbId" });

export const Season = mongoose.model("Season", seasonSchema, "seasons");
