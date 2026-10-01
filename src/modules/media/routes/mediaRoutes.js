import { Router } from "express";
import { mediaController } from "../controllers/mediaController.js";

const router = Router();

router.get("/", mediaController.getAllMedia);
router.get("/top10", mediaController.getTop10);
router.get("/slider", mediaController.getFeaturedSlider);
router.put("/slider", mediaController.updateSlider);
router.get("/upcoming", mediaController.getUpcoming);
router.get("/top-imdb", mediaController.getTopImdb);
router.get("/animations", mediaController.getAnimations);
router.get("/persian-dubbed", mediaController.getPersianDubbed);
router.get("/:slug", mediaController.getMediaBySlug);
router.get("/person/:personIMDbId", mediaController.getPersonFilmography);

export default router;
