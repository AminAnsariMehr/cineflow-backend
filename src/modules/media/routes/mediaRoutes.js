import { Router } from "express";
import { mediaController } from "../controllers/mediaController.js";

const router = Router();

router.get("/", mediaController.getAllMedia);
router.get("/top10", mediaController.getTop10Media);
router.get("/upcoming", mediaController.getUpcomingMedia);
router.get("/top-imdb", mediaController.getTopImdbMedia);
router.get("/animations", mediaController.getAnimations);
router.get("/persian-dubbed", mediaController.getPersianDubbed);
router.get("/:slug", mediaController.getMediaBySlug);

export default router;
