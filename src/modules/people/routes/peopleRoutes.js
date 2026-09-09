import { Router } from "express";
import { peopleController } from "../controllers/peopleController.js";

const router = Router();

router.get("/", peopleController.getAllPeople);
router.get("/:slug", peopleController.getPersonBySlug);

export default router;
