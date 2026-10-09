import mongoose from "mongoose";

const cleanMediaTransform = (_, ret) => {
  delete ret.__v;

  if (ret.type === "movie") delete ret.seriesDetails;

  if (ret.type === "series") {
    delete ret.duration;
    delete ret.sources;
  }

  return ret;
};

const localizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true, default: "" },
    en: { type: String, trim: true, default: "" },
  },
  { _id: false, autoIndex: false },
);

const localizedStringRequiredSchema = new mongoose.Schema(
  {
    fa: {
      type: String,
      trim: true,
      required: [true, "Persian title is required"],
    },
    en: {
      type: String,
      trim: true,
      required: [true, "English title is required"],
    },
  },
  { _id: false, autoIndex: false },
);

const localizedStringArraySchema = new mongoose.Schema(
  {
    en: { type: [{ type: String, trim: true }], default: [] },
    fa: { type: [{ type: String, trim: true }], default: [] },
  },
  { _id: false, autoIndex: false },
);

const posterSchema = new mongoose.Schema(
  {
    vertical: { type: String, required: true, trim: true },
    horizontal: { type: String, default: "", trim: true },
    backdrop: { type: String, default: "", trim: true },
  },
  { _id: false, autoIndex: false },
);

const assetsSchema = new mongoose.Schema(
  {
    poster: { type: posterSchema, required: true },
    gallery: { type: [{ type: String, trim: true }], default: [] },
    trailers: { type: [{ type: String, trim: true }], default: [] },
  },
  { _id: false, autoIndex: false },
);

const creditPersonSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      default: null,
    },
    personIMDbId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^nm\d+$/,
        "Invalid person IMDb ID format (expected nm followed by digits)",
      ],
    },
    en: { type: String, trim: true, default: "" },
    fa: { type: String, trim: true, default: "" },
  },
  { _id: false, autoIndex: false },
);

const castSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      default: null,
    },
    personIMDbId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^nm\d+$/,
        "Invalid cast person IMDb ID format (expected nm followed by digits)",
      ],
    },
    character: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Cast order must be an integer",
      },
    },
  },
  { _id: false, autoIndex: false },
);

const crewSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      default: null,
    },
    personIMDbId: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    job: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    name: { type: localizedStringSchema, default: () => ({ fa: "", en: "" }) },
  },
  { _id: false, autoIndex: false },
);

const mediaCollectionItemSchema = new mongoose.Schema(
  {
    collectionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Order must be an integer",
      },
    },
  },
  { _id: false, autoIndex: false },
);

const seriesDetailsSchema = new mongoose.Schema(
  {
    seasonsCount: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "seasonsCount must be an integer",
      },
    },
    endYear: {
      type: Number,
      default: null,
      validate: {
        validator: (v) => v === null || (Number.isInteger(v) && v >= 1888),
        message: "endYear must be a valid integer year >= 1888 or null",
      },
    },
    status: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
  },
  { _id: false, autoIndex: false },
);

const mediaSourceSchema = new mongoose.Schema(
  {
    quality: {
      type: String,
      required: true,
      enum: ["480p", "720p", "1080p", "1440p", "2160p"],
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false, autoIndex: false },
);

const mediaSchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: [true, "IMDb ID is required"],
      trim: true,
      lowercase: true,
      match: [
        /^tt\d{7,}$/,
        "Invalid IMDb ID format (must start with 'tt' followed by at least 7 digits)",
      ],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series"],
    },
    title: {
      type: localizedStringRequiredSchema,
      required: true,
    },
    originalTitle: {
      type: String,
      trim: true,
      default: "",
    },
    summary: {
      type: localizedStringSchema,
      default: () => ({ fa: "", en: "" }),
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1888,
      validate: {
        validator: (value) =>
          Number.isInteger(value) && value <= new Date().getFullYear() + 20,
        message: "releaseYear must be a valid integer year",
      },
    },
    ageRating: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      default: undefined,
      required: [
        function () {
          return this.type === "movie";
        },
        "Duration is required for movies",
      ],
      validate: {
        validator: function (value) {
          if (this.type === "movie") {
            return Number.isInteger(value) && value > 0;
          }
          return true;
        },
        message: "Duration must be a positive integer representing minutes",
      },
    },
    genres: {
      type: localizedStringArraySchema,
      default: () => ({ en: [], fa: [] }),
    },
    countries: {
      type: localizedStringArraySchema,
      default: () => ({ en: [], fa: [] }),
    },
    languages: {
      type: localizedStringArraySchema,
      default: () => ({ en: [], fa: [] }),
    },
    hasPersianDub: {
      type: Boolean,
      default: false,
    },
    collections: {
      type: [mediaCollectionItemSchema],
      default: [],
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
    rating: {
      imdb: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
      },
      rottenTomatoes: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      metacritic: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      userRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
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
    awardsSummary: {
      oscarWins: { type: Number, min: 0, default: 0 },
      oscarNominations: { type: Number, min: 0, default: 0 },
      totalWins: { type: Number, min: 0, default: 0 },
      totalNominations: { type: Number, min: 0, default: 0 },
    },
    credits: {
      directors: { type: [creditPersonSchema], default: [] },
      writers: { type: [creditPersonSchema], default: [] },
      cast: { type: [castSchema], default: [] },
      crew: { type: [crewSchema], default: [] },
    },
    assets: {
      type: assetsSchema,
      required: true,
    },
    seriesDetails: {
      type: seriesDetailsSchema,
      default: undefined,
      required: [
        function () {
          return this.type === "series";
        },
        "seriesDetails is required for series",
      ],
    },
    sources: {
      type: [mediaSourceSchema],
      default: undefined,
      required: [
        function () {
          return this.type === "movie";
        },
        "Sources array is required for movies",
      ],
      validate: {
        validator: function (value) {
          if (this.type === "movie") {
            return Array.isArray(value) && value.length > 0;
          }
          return true;
        },
        message: "Sources array cannot be empty for movies.",
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "featuredOrder must be an integer",
      },
    },
  },
  {
    timestamps: true,
    id: false,
    autoIndex: false,
    toJSON: {
      virtuals: true,
      transform: cleanMediaTransform,
    },
    toObject: {
      virtuals: true,
      transform: cleanMediaTransform,
    },
  },
);

mediaSchema.pre("validate", function () {
  if (this.type === "movie") {
    this.seriesDetails = undefined;
  } else if (this.type === "series") {
    this.duration = undefined;
    this.sources = undefined;
  }
});

mediaSchema.index({ imdbId: 1 }, { unique: true, name: "uniq_imdbId" });
mediaSchema.index({ slug: 1 }, { unique: true, name: "uniq_slug" });

mediaSchema.index(
  { type: 1, createdAt: -1, _id: -1 },
  { name: "idx_type_createdAt_id" },
);
mediaSchema.index(
  { type: 1, releaseYear: -1, _id: -1 },
  { name: "idx_type_releaseYear_id" },
);
mediaSchema.index(
  { isTop10: 1, "rating.imdb": -1, _id: -1 },
  { name: "idx_top10_rating" },
);
mediaSchema.index(
  { isUpcoming: 1, releaseYear: 1, _id: -1 },
  { name: "idx_upcoming" },
);
mediaSchema.index(
  { "genres.en": 1, createdAt: -1, _id: -1 },
  { name: "idx_genres_en_sort" },
);
mediaSchema.index(
  { "genres.fa": 1, createdAt: -1, _id: -1 },
  { name: "idx_genres_fa_sort" },
);
mediaSchema.index(
  { "rating.imdb": -1, "rating.voteCount": -1, createdAt: -1, _id: -1 },
  { name: "idx_top_imdb_full_sort" },
);

mediaSchema.index(
  { "credits.cast.personIMDbId": 1, releaseYear: -1, createdAt: -1 },
  { name: "idx_cast_person_timeline" },
);
mediaSchema.index(
  { "credits.cast.person": 1, releaseYear: -1, _id: -1 },
  { name: "idx_cast_person_objectid" },
);
mediaSchema.index(
  { "credits.directors.personIMDbId": 1, releaseYear: -1 },
  { name: "idx_directors_person_timeline" },
);
mediaSchema.index(
  { "credits.writers.personIMDbId": 1, releaseYear: -1 },
  { name: "idx_writers_person_timeline" },
);
mediaSchema.index(
  { "credits.crew.person": 1, releaseYear: -1 },
  { name: "idx_crew_person_objectid" },
);

mediaSchema.index(
  { "collections.collectionRef": 1, "collections.order": 1 },
  { name: "idx_collections_ref_order" },
);
mediaSchema.index(
  { isFeatured: 1, featuredOrder: 1, createdAt: -1 },
  { name: "idx_featured_slider" },
);

export const Media = mongoose.model("Media", mediaSchema, "media");
