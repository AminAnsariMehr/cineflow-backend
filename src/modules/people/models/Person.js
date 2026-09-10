// src/modules/people/models/Person.js
import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
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
    name: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    biography: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    birthDate: {
      type: String,
      default: null,
    },
    birthPlace: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    deathDate: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    primaryProfessions: [{ type: String, trim: true }],
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

personSchema.index({ "name.en": 1 });
personSchema.index({ "name.fa": 1 });

export const Person = mongoose.model("Person", personSchema);
