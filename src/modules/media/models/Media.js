import mongoose from "mongoose";

const localizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true },
    en: { type: String, trim: true, required: true },
  },
  { _id: false },
);

const ratingsSchema = new mongoose.Schema(
  {
    imdb: { type: Number, index: true },
    rottenTomatoes: { type: Number },
    metacritic: { type: Number },
  },
  { _id: false },
);

const mediaAssetsSchema = new mongoose.Schema(
  {
    poster: { type: String },
    backdrop: { type: String },
    trailerUrl: { type: String },
    logo: { type: String },
  },
  { _id: false },
);

const collectionInfoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true },
    title: localizedStringSchema,
    order: { type: Number },
  },
  { _id: false },
);

const seriesDetailsSchema = new mongoose.Schema(
  {
    seasonsCount: { type: Number },
    totalEpisodes: { type: Number },
    episodeDuration: { type: Number },
    status: { type: String, enum: ["returning_series", "ended", "canceled"] },
  },
  { _id: false },
);

const baseMediaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series"],
      index: true,
    },
    title: localizedStringSchema,
    slug: { type: String, required: true, unique: true, index: true },
    releaseYear: { type: Number, required: true, index: true },
    rating: ratingsSchema,
    genres: { type: [String], index: true },
    countries: { type: [String], index: true },
    languages: { type: [String], index: true },
    ageRating: { type: String, index: true },
    crew: {
      directors: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Actor",
          index: true,
        },
      ],
      actors: [
        {
          actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Actor",
            required: true,
            index: true,
          },
          role: { type: String, trim: true },
        },
      ],
      writers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Actor", index: true },
      ],
    },
    media: mediaAssetsSchema,
    synopsis: localizedStringSchema,
    status: {
      type: String,
      enum: ["released", "upcoming", "in_production"],
      default: "released",
      index: true,
    },
    collection: collectionInfoSchema,
    seriesDetails: seriesDetailsSchema,
  },
  { timestamps: true },
);

baseMediaSchema.index({ releaseYear: -1 });
baseMediaSchema.index({ "rating.imdb": -1 });

const Media = mongoose.model("Media", baseMediaSchema);

export default Media;
