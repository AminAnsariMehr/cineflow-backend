import mongoose from "mongoose";
import {
  ALLOWED_RELATIONSHIP_TYPES,
  normalizeRelationshipType,
} from "../utils/relationship.util.js";

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
    imdbId: { type: String, default: null, trim: true },
    attributes: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const dateValidator = {
  validator: (v) => v == null || v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v),
  message: "Date must be in YYYY-MM-DD format",
};

const personSchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
      trim: true,
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
      validate: dateValidator,
    },
    deathDate: {
      type: String,
      default: null,
      validate: dateValidator,
    },
    birthPlace: {
      type: localizedStringSchema,
      default: () => ({ en: "", fa: "" }),
    },
    height: {
      type: Number,
      default: null,
      min: 0,
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
      min: 1,
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
      type: [
        {
          type: String,
          trim: true,
        },
      ],
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

// Indexes (تعریف یکتایی صرفاً در ایندکس‌ها)
personSchema.index({ imdbId: 1 }, { unique: true, name: "idx_person_imdb_id" });
personSchema.index({ slug: 1 }, { unique: true, name: "idx_person_slug" });
personSchema.index({ "name.en": 1, _id: 1 }, { name: "idx_person_name_en_id" });
personSchema.index({ "name.fa": 1, _id: 1 }, { name: "idx_person_name_fa_id" });
personSchema.index(
  { "primaryProfessions.en": 1, "name.en": 1, _id: 1 },
  { name: "idx_person_prof_en_name_en_id" },
);
personSchema.index(
  { "primaryProfessions.fa": 1, "name.fa": 1, _id: 1 },
  { name: "idx_person_prof_fa_name_fa_id" },
);
personSchema.index(
  { "name.en": "text", "name.fa": "text" },
  { weights: { "name.en": 2, "name.fa": 1 }, name: "idx_person_name_text" },
);

export const Person = mongoose.model("Person", personSchema);
