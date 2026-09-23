import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down server...`);

      server.close(async (serverError) => {
        if (serverError) {
          console.error("Error while closing HTTP server:", serverError);
          process.exit(1);
        }

        try {
          await mongoose.connection.close();
          console.log("Database connection closed");
          process.exit(0);
        } catch (error) {
          console.error("Error while closing MongoDB connection:", error);
          process.exit(1);
        }
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
