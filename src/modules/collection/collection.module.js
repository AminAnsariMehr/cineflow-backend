import collectionRouter from "./routes/collectionRoutes.js";

export const collectionModule = (app) => {
  app.use("/api/collection", collectionRouter);
};
