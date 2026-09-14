import mongoose from "mongoose";

const cleanCollectionTransform = (_, ret) => {
  delete ret.__v;
  return ret;
};

const collectionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      fa: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    summary: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    assets: {
      poster: { type: String, default: "", trim: true },
      backdrop: { type: String, default: "", trim: true },
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      virtuals: true,
      transform: cleanCollectionTransform,
    },
    toObject: {
      virtuals: true,
      transform: cleanCollectionTransform,
    },
  },
);

collectionSchema.index({ "title.fa": "text", "title.en": "text" });

export const MediaCollection = mongoose.model("Collection", collectionSchema);
