import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    vertical: { type: String, required: true, trim: true },
    horizontal: { type: String, default: "", trim: true },
    backdrop: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const assetsSchema = new mongoose.Schema(
  {
    poster: { type: posterSchema, required: true },
    gallery: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    trailers: {
      type: [trailerSchema],
      default: [],
    },
  },
  { _id: false },
);

const trailerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^https?:\/\/\S+$/i.test(value),
        message: "Trailer URL must be a valid HTTP or HTTPS URL",
      },
    },
    quality: {
      type: String,
      enum: ["360p", "480p", "720p", "1080p", "1440p", "2160p"],
      default: "1080p",
      trim: true,
    },
  },
  { _id: false },
);

const castSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    character: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    order: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Cast order must be an integer",
      },
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
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series", "anime", "documentary"],
    },
    title: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    originalTitle: { type: String, trim: true },
    summary: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, default: "", trim: true },
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1888,
      max: new Date().getFullYear() + 20,
    },
    ageRating: {
      type: String,
      enum: [
        "+3",
        "+7",
        "+12",
        "+15",
        "+17",
        "+18",
        "G",
        "PG",
        "PG-13",
        "R",
        "NC-17",
        "TV-MA",
        "TV-14",
        "TV-PG",
        null,
      ],
      default: null,
    },
    runtime: {
      type: Number,
      min: 0,
      default: null,
    },
    genres: [{ type: String, trim: true }],
    countries: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    assets: {
      type: assetsSchema,
      required: true,
      poster: {
        vertical: { type: String, required: true, trim: true },
        horizontal: { type: String, default: "", trim: true },
        backdrop: { type: String, default: "", trim: true },
      },
      gallery: {
        type: [{ type: String, trim: true }],
        default: [],
      },
      trailers: {
        type: [trailerSchema],
        default: [],
      },
    },
    rating: {
      imdb: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
        validate: {
          validator: (value) => value == null || Number.isInteger(value * 10),
          message: "IMDb rating must have at most one decimal place",
        },
      },
      rottenTomatoes: { type: Number, min: 0, max: 100, default: null },
      metacritic: { type: Number, min: 0, max: 100, default: null },
      userRating: { type: Number, min: 0, max: 5, default: null },
      voteCount: {
        type: Number,
        min: 0,
        default: 0,
        validate: {
          validator: Number.isInteger,
          message: "voteCount must be an integer",
        },
      },
    },
    credits: {
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
      cast: [castSchema],
    },
    isTop10: {
      type: Boolean,
      default: false,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

mediaSchema.index({ type: 1, releaseYear: -1 });
mediaSchema.index({ genres: 1 });
mediaSchema.index({ languages: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index(
  { "rating.imdb": -1 },
  { partialFilterExpression: { isTop10: true } },
);
aSchema.index({ isUpcoming: 1, releaseYear: 1 });

export const Media = mongoose.model("Media", mediaSchema);
