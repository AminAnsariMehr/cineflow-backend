import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import path from "path";

import { env } from "./config/env.js";

// --------------------- Middlewares ---------------------
import {
  errorHandler,
  notFoundHandler,
} from "#middlewares/error.middleware.js";

// ----------------------- Module ------------------------
import { mediaModule } from "./modules/media/media.module.js";
import { peopleModule } from "./modules/people/people.module.js";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  express.json({
    limit: "1mb",
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  }),
);

app.use(express.static(path.resolve("public")));

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (env.allowedOrigins === "*" || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    optionsSuccessStatus: 204,
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
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
