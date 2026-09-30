import personRouter from "./routes/personRoutes.js";

export const personModule = (app) => {
  app.use("/api/person", personRouter);
};
