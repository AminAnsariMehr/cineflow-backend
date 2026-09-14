import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;
let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  listenersRegistered = true;
};

export const connectDB = async () => {
  registerConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  connectionPromise = null;
};
