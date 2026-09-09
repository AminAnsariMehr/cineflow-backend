import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  if (env.nodeEnv !== "test") {
    console.error(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
    });
  }

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "unknown";
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message:
      env.nodeEnv === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
};
