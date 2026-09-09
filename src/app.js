import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

// --------------------- Middlewares ---------------------
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

// ----------------------- Module ------------------------
import { mediaModule } from "./modules/media/media.module.js";
import { peopleModule } from "./modules/people/people.module.js";

const app = express();

const allowedOrigins =
  env.corsOrigin === "*"
    ? "*"
    : env.corsOrigin
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins === "*") {
        return callback(null, true);
      }

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// -------- Module Registration ----------
mediaModule(app);
peopleModule(app);

// ------ Middleware Registration --------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
