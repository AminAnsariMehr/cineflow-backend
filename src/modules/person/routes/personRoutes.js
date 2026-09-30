import { Router } from "express";
import { personController } from "../controllers/personController.js";
import { uploadAvatar } from "./../../../middlewares/upload.middleware.js";

const router = Router();

// روت‌های عمومی و صفحه‌بندی
router.get("/", personController.getAllPerson);

// اولویت‌بندی روت فرعی رسانه‌ها قبل از روت عام پارامتریک
router.get("/:imdbId/media", personController.getPersonMedia);

// روت تک شناسه (اسلاگ، آی‌دی یا کد IMDB)
router.get("/:identifier", personController.getPersonByIdentifier);

// عملیات CRUD مدیریتی
router.post("/", uploadAvatar.single("avatar"), personController.createPerson);

router.put(
  "/:id",
  uploadAvatar.single("avatar"),
  personController.updatePerson,
);

router.delete("/:id", personController.deletePerson);

export default router;
