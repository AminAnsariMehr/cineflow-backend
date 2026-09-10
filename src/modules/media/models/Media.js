import mongoose from "mongoose";

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
    storyline: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    ageRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17", "TV-MA", "TV-14", "TV-PG", null],
      default: null,
    },
    runtime: {
      type: Number,
      default: null,
    },
    genres: [{ type: String, trim: true }],
    countries: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    poster: {
      vertical: { type: String, required: true },
      horizontal: { type: String, default: "" },
      backdrop: { type: String, default: "" },
    },
    rating: {
      imdb: { type: Number, default: null },
      rottenTomatoes: { type: Number, default: null },
      metacritic: { type: Number, default: null },
      userRating: { type: Number, default: 0 },
      voteCount: { type: Number, default: 0 },
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
      cast: [
        {
          person: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
            required: true,
          },
          character: {
            fa: { type: String, trim: true },
            en: { type: String, trim: true },
          },
          order: { type: Number, default: 0 },
        },
      ],
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
mediaSchema.index({ isTop10: 1, "rating.imdb": -1 });
mediaSchema.index({ isUpcoming: 1, releaseYear: 1 });

export const Media = mongoose.model("Media", mediaSchema);
