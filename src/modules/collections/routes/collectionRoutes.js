import { Router } from "express";
import { collectionController } from "../controllers/collectionController.js";

const router = Router();

router.get("/", collectionController.getAllCollections);
router.post("/", collectionController.createCollection);
router.get("/:slug", collectionController.getCollectionBySlug);
router.patch("/:id", collectionController.updateCollection);
router.delete("/:id", collectionController.deleteCollection);

export default router;
