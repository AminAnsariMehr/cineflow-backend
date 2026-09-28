import seasonsRouter from "./routes/seasonsRoutes.js";

export const seasonsModule = (app) => {
  app.use("/api/seasons", seasonsRouter);
};
