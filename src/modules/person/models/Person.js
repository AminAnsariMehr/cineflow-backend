import mongoose from "mongoose";
import {
  ALLOWED_RELATIONSHIP_TYPES,
  normalizeRelationshipType,
} from "../utils/relationship.util.js";

const isValidCalendarDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const dateValidator = {
  validator: (v) =>
    v === null || v === undefined || v === "" || isValidCalendarDate(v),
  message: "Date must be a valid calendar date in YYYY-MM-DD format",
};

const localizedStringSchema = new mongoose.Schema(
  {
    en: { type: String, default: "", trim: true },
    fa: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const localizedRequiredNameSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    fa: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const localizedProfessionsSchema = new mongoose.Schema(
  {
    en: [{ type: String, trim: true }],
    fa: [{ type: String, trim: true }],
  },
  { _id: false },
);

const awardsSummarySchema = new mongoose.Schema(
  {
    oscarWins: { type: Number, default: 0, min: 0 },
    oscarNominations: { type: Number, default: 0, min: 0 },
    totalWins: { type: Number, default: 0, min: 0 },
    totalNominations: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const personalRelationshipSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      lowercase: true,
      set: normalizeRelationshipType,
      enum: {
        values: ALLOWED_RELATIONSHIP_TYPES,
        message: "Invalid relationship type: {VALUE}",
      },
      default: "relative",
    },
    name: { type: String, required: true, trim: true },
    imdbId: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => v === null || v === "" || /^nm\d+$/i.test(v),
        message: "Invalid IMDb ID for relationship",
      },
    },
    attributes: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const personSchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^nm\d+$/,
        "Invalid person IMDb ID format (expected 'nm' followed by digits)",
      ],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: localizedRequiredNameSchema,
      required: true,
    },
    birthName: {
      type: String,
      default: null,
      trim: true,
    },
    birthDate: {
      type: String,
      default: null,
      set: (v) => (!v ? null : v),
      validate: dateValidator,
    },
    deathDate: {
      type: String,
      default: null,
      set: (v) => (!v ? null : v),
      validate: dateValidator,
    },
    birthPlace: {
      type: localizedStringSchema,
      default: () => ({ en: "", fa: "" }),
    },
    height: {
      type: Number,
      default: null,
      min: [0, "Height must be a positive number"],
    },
    biography: {
      type: localizedStringSchema,
      default: () => ({ en: "", fa: "" }),
    },
    primaryProfessions: {
      type: localizedProfessionsSchema,
      default: () => ({ en: [], fa: [] }),
    },
    starmeterRank: {
      type: Number,
      default: null,
      min: [1, "Starmeter rank must be at least 1"],
    },
    awardsSummary: {
      type: awardsSummarySchema,
      default: () => ({
        oscarWins: 0,
        oscarNominations: 0,
        totalWins: 0,
        totalNominations: 0,
      }),
    },
    personalRelationships: {
      type: [personalRelationshipSchema],
      default: [],
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [{ type: String, trim: true }],
      validate: [
        (val) => !Array.isArray(val) || val.length <= 5,
        "The images gallery cannot exceed 5 items.",
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
personSchema.index({ imdbId: 1 }, { unique: true, name: "idx_person_imdb_id" });
personSchema.index({ slug: 1 }, { unique: true, name: "idx_person_slug" });

// Sort & Pagination Index (Compound with _id for deterministic B-Tree sort)
personSchema.index(
  { starmeterRank: 1, _id: -1 },
  { name: "idx_person_starmeter_id" },
);

// Compound indexes covering filter + sort criteria
personSchema.index(
  { "primaryProfessions.en": 1, starmeterRank: 1, _id: -1 },
  { name: "idx_person_prof_en_rank_id" },
);
personSchema.index(
  { "primaryProfessions.fa": 1, starmeterRank: 1, _id: -1 },
  { name: "idx_person_prof_fa_rank_id" },
);

// Full-text search with language none (prevents English stemmer from ruining Persian text)
personSchema.index(
  { "name.en": "text", "name.fa": "text" },
  {
    weights: { "name.en": 2, "name.fa": 1 },
    name: "idx_person_name_text",
    default_language: "none",
  },
);

export const Person = mongoose.model("Person", personSchema);
