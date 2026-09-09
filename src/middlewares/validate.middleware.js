import mongoose from "mongoose";

export const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];

  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({
      success: false,
      message: `${paramName} is not a valid MongoDB ObjectId`,
    });
  }

  next();
};
