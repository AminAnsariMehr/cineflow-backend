import { Router } from "express";
import { personController } from "../controllers/personController.js";
import { uploadAvatar } from "./../../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", personController.getAllPerson);

router.get("/:imdbId/media", personController.getPersonMedia);

router.get("/:identifier", personController.getPersonByIdentifier);

router.post("/", uploadAvatar.single("avatar"), personController.createPerson);

router.put(
  "/:id",
  uploadAvatar.single("avatar"),
  personController.updatePerson,
);

router.delete("/:id", personController.deletePerson);

export default router;
