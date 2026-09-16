import collectionRouter from "./routes/collectionRoutes.js";

export const collectionsModule = (app) => {
  app.use("/api/collections", collectionRouter);
};
