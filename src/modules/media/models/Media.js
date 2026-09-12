import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    vertical: { type: String, required: true, trim: true },
    horizontal: { type: String, default: "", trim: true },
    backdrop: { type: String, default: "", trim: true },
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

const seriesDetailsSchema = new mongoose.Schema(
  {
    seasonsCount: { type: Number, min: 0, default: 0 },
    totalEpisodes: { type: Number, min: 0, default: 0 },
    episodeDuration: { type: Number, min: 0, default: null },
    status: {
      type: String,
      enum: ["ongoing", "completed", "renewed", "canceled"],
      default: "ongoing",
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
      enum: ["movie", "series"],
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
      validate: {
        validator: (value) => value <= new Date().getFullYear() + 20,
        message: "releaseYear is too far in the future",
      },
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
      ],
      default: null,
    },

    duration: {
      type: Number,
      min: 0,
      default: null,
      validate: {
        validator: function (value) {
          if (this.type === "movie" && (value == null || value <= 0)) {
            return false;
          }
          return true;
        },
        message: "Duration is required for movies and must be greater than 0",
      },
    },

    genres: [
      {
        type: String,
        trim: true,
        enum: [
          "Action",
          "Adventure",
          "Animation",
          "Biography",
          "Comedy",
          "Crime",
          "Drama",
          "Fantasy",
          "Film Noir",
          "History",
          "Horror",
          "Mystery",
          "Musical",
          "Romance",
          "Superhero",
          "Thriller",
          "Sci-Fi",
          "War",
          "Western",
        ],
      },
    ],
    countries: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    assets: { type: assetsSchema, required: true },

    rating: {
      imdb: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
        validate: {
          validator: (value) =>
            value == null || /^\d+(\.\d)?$/.test(String(value)),
          message: "IMDb rating must have at most one decimal place",
        },
      },
      rottenTomatoes: { type: Number, min: 0, max: 100, default: null },
      metacritic: { type: Number, min: 0, max: 100, default: null },
      userRating: { type: Number, min: 0, max: 5, default: 0 },
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

    seriesDetails: {
      type: seriesDetailsSchema,
      default: null,

      validate: {
        validator: function (value) {
          if (this.type === "series" && !value) return false;

          return true;
        },
        message: "seriesDetails is required for series type.",
      },
    },

    collectionInfo: {
      collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        default: null,
      },
      order: {
        type: Number,
        min: 1,
        default: null,
        validate: {
          validator: function (value) {
            if (
              this.collectionInfo?.collection &&
              (value == null || value < 1)
            ) {
              return false;
            }
            return true;
          },
          message: "Order is required when a collection is assigned",
        },
      },
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
        if (ret.type === "movie") delete ret.seriesDetails;
        if (ret.type === "series") delete ret.duration;
        return ret;
      },
    },

    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        if (ret.type === "movie") delete ret.seriesDetails;
        if (ret.type === "series") delete ret.duration;
        return ret;
      },
    },
  },
);

// فیلترها و مرتب‌سازی‌های ترکیبی
mediaSchema.index({ type: 1, createdAt: -1 });
mediaSchema.index({ genres: 1, createdAt: -1 });
mediaSchema.index({ languages: 1, createdAt: -1 });

// ایندکس‌های مربوط به رفرنس‌های People
mediaSchema.index({ "credits.directors": 1 });
mediaSchema.index({ "credits.writers": 1 });
mediaSchema.index({ "credits.cast.person": 1 });

// ایندکس پارشیال پرسرعت و بهینه برای بخش Top 10
mediaSchema.index(
  { "rating.imdb": -1, createdAt: -1 },
  { partialFilterExpression: { isTop10: true } },
);

// ایندکس جهت برطرف کردن Full Scan در متد findTopImdb
mediaSchema.index({ "rating.imdb": -1, "rating.voteCount": -1 });

// کالکشن و زمان‌بندی فرنچایزها
mediaSchema.index({ isUpcoming: 1, releaseYear: 1 });
mediaSchema.index({
  "collectionInfo.collection": 1,
  "collectionInfo.order": 1,
});

export const Media = mongoose.model("Media", mediaSchema);
