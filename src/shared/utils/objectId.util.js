import mongoose from "mongoose";

export const isValidObjectId = (value) => {
  return mongoose.isValidObjectId(value);
};

export const toObjectId = (value) => {
  if (!mongoose.isValidObjectId(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};
