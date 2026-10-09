import { Router } from "express";
import { mediaController } from "../controllers/mediaController.js";

const router = Router();

router.get("/", mediaController.getAllMedia);
router.get("/top10", mediaController.getTop10);
router.get("/slider", mediaController.getFeaturedSlider);
router.get("/upcoming", mediaController.getUpcoming);
router.get("/top-imdb", mediaController.getTopImdb);
router.get("/animations", mediaController.getAnimations);
router.get("/persian-dubbed", mediaController.getPersianDubbed);

router.put("/slider", mediaController.updateSlider);

router.get("/person/:personIMDbId", mediaController.getPersonFilmography);
router.get("/:identifier", mediaController.getMediaByIdentifier);

export default router;
