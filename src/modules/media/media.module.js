import mediaRouter from "./routes/mediaRoutes.js";

export const mediaModule = (app) => {
  app.use("/api/media", mediaRouter);
};
