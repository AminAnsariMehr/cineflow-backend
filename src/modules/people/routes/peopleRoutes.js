import { Router } from "express";
import { actorsController } from "../controllers/peopleController.js";

const router = Router();

router.get("/", actorsController.getAllActors);

export default router;
