import mongoose from "mongoose";

export function getEntityId(entity) {
  if (!entity || typeof entity !== "object") return null;

  const raw = entity._id ?? entity;

  if (raw == null) return null;

  if (raw instanceof mongoose.Types.ObjectId) return raw.toString();

  if (typeof raw === "string") return raw;

  if (typeof raw === "object") {
    if (raw._id instanceof mongoose.Types.ObjectId) return raw._id.toString();

    if (typeof raw._id === "string") return raw._id;

    if (typeof raw.toString === "function") {
      const s = raw.toString();

      if (s && s !== "[object Object]") return s;
    }
  }

  return null;
}

export function toPlainObject(doc) {
  if (!doc || typeof doc !== "object") return null;
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
}
