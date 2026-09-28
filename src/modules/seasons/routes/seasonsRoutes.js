import { Router } from "express";
import { seasonsController } from "../controllers/seasonsController.js";

const router = Router();

router.get("/:imdbId", seasonsController.getSeasons);

router.get("/:imdbId/:seasonNumber", seasonsController.getSeasonDetails);

export default router;
