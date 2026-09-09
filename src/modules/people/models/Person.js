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

const personSchema = new mongoose.Schema(
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
    name: requiredLocalizedStringSchema,
    biography: optionalLocalizedStringSchema,
    birthDate: { type: Date, default: null },
    birthPlace: optionalLocalizedStringSchema,
    deathDate: { type: Date, default: null },
    avatar: imageSchema,
    primaryProfessions: [
      {
        type: String,
        enum: ["actor", "director", "writer", "producer", "composer"],
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Person = mongoose.model("Person", personSchema);
