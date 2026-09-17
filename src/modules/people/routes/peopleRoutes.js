import { Router } from "express";
import { peopleController } from "../controllers/peopleController.js";
import { uploadAvatar } from "./../../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", peopleController.getAllPeople);
router.get("/:slug", peopleController.getPersonBySlug);
router.post("/", uploadAvatar.single("avatar"), peopleController.createPerson);
router.put(
  "/:id",
  uploadAvatar.single("avatar"),
  peopleController.updatePerson,
);
router.delete("/:id", peopleController.deletePerson);

export default router;
