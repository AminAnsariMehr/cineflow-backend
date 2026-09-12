import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
  try {
    await connectDB();

    // app.listen(env.port, () => {
    //   console.log(`Server running on http://localhost:${env.port}`);
    // });

    const server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });

    // const shutdown = async (signal) => {
    //   console.log(`${signal} received. Shutting down server...`);

    //   server.close(async (serverError) => {

    //    if (serverError) {
    //       console.error("Error while closing HTTP server:", serverError);
    //       process.exit(1);
    //     }

    //     try {
    //       await import("mongoose").then(({ default: mongoose }) =>
    //         mongoose.connection.close(),
    //       );

    //       console.log("Server closed successfully");
    //       process.exit(0);
    //     } catch (error) {
    //       console.error("Error while closing server:", error);
    //       process.exit(1);
    //     }
    //   });
    // };

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
