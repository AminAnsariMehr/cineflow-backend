import { Router } from "express";
import { seasonsController } from "../controllers/seasonsController.js";

const router = Router();

router.get("/media/:mediaImdbId", seasonsController.getSeasonsByMedia);

router.get(
  "/media/:mediaImdbId/:seasonNumber",
  seasonsController.getSeasonByNumber,
);

router.get(
  "/media/:mediaImdbId/:seasonNumber/episodes/:episodeNumber",
  seasonsController.getEpisode,
);

router.get("/:id", seasonsController.getSeasonById);

export default router;
