import actorsRouter from "./routes/actorsRoutes.js";

export const actorsModule = (app) => {
  app.use("/api/actors", actorsRouter);
};
