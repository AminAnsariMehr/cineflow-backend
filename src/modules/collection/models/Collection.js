// src/modules/collection/models/Collection.js
import mongoose from "mongoose";

// ۱. حذف __v و تمیزسازی خروجی
const cleanCollectionTransform = (_, ret) => {
  delete ret.__v;
  return ret;
};

// ۲. اسکیمای رشته‌های دو زبانه بدون _id اضافه
const localizedStringSchema = new mongoose.Schema(
  {
    fa: { type: String, trim: true, default: "" },
    en: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const collectionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: localizedStringSchema,
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
    type: {
      type: String,
      enum: ["franchise", "universe", "anthology", "curated"],
      default: "franchise",
    },
    assets: {
      poster: {
        vertical: { type: String, trim: true, default: "" },
        horizontal: { type: String, trim: true, default: "" },
      },
      backdrop: { type: String, trim: true, default: "" },
      logo: { type: String, trim: true, default: "" },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true, transform: cleanCollectionTransform },
    toObject: { virtuals: true, transform: cleanCollectionTransform },
  },
);

// collectionSchema.index({ slug: 1 });

collectionSchema.index({ isFeatured: 1, featuredOrder: 1 });

collectionSchema.index({ "title.fa": "text", "title.en": "text" });

export const Collection = mongoose.model(
  "Collection",
  collectionSchema,
  "collections",
);
