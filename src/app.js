import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// ---------------------Middlewares ---------------------
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

// ---------------- Module Registration -----------------
import { mediaModule } from "./modules/media/media.module.js";
import { actorsModule } from "./modules/actors/actors.module.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(",").map((item) =>
  item.trim(),
);

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

mediaModule(app);
actorsModule(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
