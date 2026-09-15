import mongoose from "mongoose";

const cleanPersonTransform = (_, ret) => {
  delete ret.__v;
  return ret;
};

const personSchema = new mongoose.Schema(
  {
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
      validate: {
        validator: (v) => v == null || /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    deathDate: {
      type: String,
      default: null,
      validate: {
        validator: (v) => v == null || /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    birthPlace: {
      fa: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    avatar: {
      type: String,
      default: "",
    },
    primaryProfessions: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      virtuals: true,
      transform: cleanPersonTransform,
    },
    toObject: {
      virtuals: true,
      transform: cleanPersonTransform,
    },
  },
);

personSchema.index({ "name.en": 1, _id: 1 }, { name: "idx_person_name_en_id" });
personSchema.index({ "name.fa": 1, _id: 1 }, { name: "idx_person_name_fa_id" });
personSchema.index(
  { primaryProfessions: 1, "name.en": 1, _id: 1 },
  { name: "idx_person_profession_name_en_id" },
);

export const Person = mongoose.model("Person", personSchema);
