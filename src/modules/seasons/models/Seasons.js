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
    episodeNumber: { type: Number, required: true, min: 1 },
    title: { type: localizedStringSchema, default: () => ({ fa: "", en: "" }) },
    summary: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    duration: { type: Number, required: true, min: 1 },
    releaseDate: { type: Date, default: null },
    thumbnail: { type: String, trim: true, default: "" },
    sources: { type: [sourceSchema], default: [] },
    isFree: { type: Boolean, default: false },
  },
  { _id: false, autoIndex: false },
);

const seasonSchema = new mongoose.Schema(
  {
    mediaImdbId: { type: String, required: true, trim: true, index: true },
    seasonNumber: { type: Number, required: true, min: 1 },
    title: { type: localizedStringSchema, default: () => ({ fa: "", en: "" }) },
    poster: { type: String, trim: true, default: "" },
    releaseYear: { type: Number, default: null },
    episodes: { type: [episodeSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: cleanSeasonTransform },
    toObject: { virtuals: true, transform: cleanSeasonTransform },
  },
);

seasonSchema.index({ mediaImdbId: 1, seasonNumber: 1 }, { unique: true });

export const Season = mongoose.model("Season", seasonSchema, "seasons");
