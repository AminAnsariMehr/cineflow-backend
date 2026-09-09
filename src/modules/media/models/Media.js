import mongoose from "mongoose";

const requiredLocalizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true },
    en: { type: String, trim: true, required: true },
  },
  { _id: false },
);

const optionalLocalizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true },
    en: { type: String, trim: true },
  },
  { _id: false },
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const ratingSchema = new mongoose.Schema(
  {
    imdb: { type: Number, min: 0, max: 10 },
  },
  { _id: false },
);

const collectionInfoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: optionalLocalizedStringSchema,
    order: { type: Number },
  },
  { _id: false },
);

const castMemberSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    character: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const seriesDetailsSchema = new mongoose.Schema(
  {
    totalSeasons: { type: Number, min: 1 },
    totalEpisodes: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ["returning", "ended", "canceled", "mini-series"],
    },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["movie", "series"],
      required: true,
      index: true,
    },
    title: requiredLocalizedStringSchema,
    originalTitle: { type: String, trim: true },
    synopsis: optionalLocalizedStringSchema,
    releaseYear: { type: Number, required: true, index: true },
    runtime: { type: Number, min: 1 },
    genres: [{ type: String, trim: true }],
    countries: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    poster: imageSchema,
    backdrop: imageSchema,
    trailerUrl: { type: String, trim: true },
    rating: ratingSchema,
    isTop10: { type: Boolean, default: false, index: true },
    isUpcoming: { type: Boolean, default: false, index: true },
    collection: collectionInfoSchema,
    seriesDetails: seriesDetailsSchema,
    credits: {
      cast: [castMemberSchema],
      directors: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Person",
        },
      ],
      writers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Person",
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

mediaSchema.index({ releaseYear: -1, createdAt: -1 });
mediaSchema.index({ "rating.imdb": -1 });
mediaSchema.index({ "credits.cast.person": 1, releaseYear: -1 });
mediaSchema.index({ "credits.directors": 1, releaseYear: -1 });
mediaSchema.index({ "credits.writers": 1, releaseYear: -1 });

export const Media = mongoose.model("Media", mediaSchema);
