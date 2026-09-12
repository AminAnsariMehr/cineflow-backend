import mongoose from "mongoose";
import { env } from "../config/env.js";

const isDevelopment = env.nodeEnv === "development";

const getValidationMessage = (error) => {
  if (!error.errors) {
    return "Validation failed";
  }

  return Object.values(error.errors)
    .map((item) => item.message)
    .filter(Boolean)
    .join(", ");
};

const getDuplicateKeyMessage = (error) => {
  const duplicatedFields = Object.keys(error.keyValue || {});

  if (duplicatedFields.length === 0) {
    return "Duplicate value already exists";
  }

  return `Duplicate value for field: ${duplicatedFields.join(", ")}`;
};

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);

  error.statusCode = 404;
  error.isOperational = true;

  next(error);
};

export const errorHandler = (err, req, res, next) => {
  void next;

  if (env.nodeEnv !== "test") {
    console.error(err);
  }

  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  let message = err.message || "Internal Server Error";

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON body";
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = getValidationMessage(err);
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  if (err?.code === 11000) {
    statusCode = 409;
    message = getDuplicateKeyMessage(err);
  }

  if (err?.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const response = {
    success: false,
    message:
      statusCode >= 500 && !isDevelopment ? "Internal Server Error" : message,
  };

  if (isDevelopment) {
    response.stack = err.stack;
    response.errorName = err.name;
  }

  return res.status(statusCode).json(response);
};
