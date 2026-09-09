import { Router } from "express";
import { mediaController } from "./controllers/mediaController.js";

export const mediaModule = (app) => {
  const router = Router();

  router.get("/animations", mediaController.getAnimations);
  router.get("/persian-dubbed", mediaController.getPersianDubbed);
  router.get("/latest-series", mediaController.getLatestSeries);
  router.get("/latest-movies", mediaController.getLatestMovies);
  router.get("/latest-media", mediaController.getLatestMedia);
  router.get("/imdb-top", mediaController.getImdbTop);

  router.get("/", mediaController.getAllMedia);
  router.get("/:slug", mediaController.getMediaBySlug);

  app.use("/api/media", router);
};
