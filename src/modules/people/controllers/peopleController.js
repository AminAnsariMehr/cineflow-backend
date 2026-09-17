import { peopleService } from "../services/peopleService.js";
import { BadRequestError } from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";

// const parseMultipartBody = (body) => {
//   const payload = { ...body };
//   const jsonFields = ["name", "biography", "birthPlace", "primaryProfessions"];

//   for (const field of jsonFields) {
//     if (typeof payload[field] === "string") {
//       try {
//         payload[field] = JSON.parse(payload[field]);
//       } catch {
//         // اگر فرمت جیسون نبود (مثلاً استرینگ ساده بود)، دست‌نخورده باقی می‌ماند
//       }
//     }
//   }

//   return payload;
// };

const safeJsonParse = (value, fieldName) => {
  if (value == null) return undefined;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new BadRequestError(`Invalid JSON for field '${fieldName}'`);
  }
};

const parseMultipartBody = (body) => {
  const payload = { ...body };

  payload.name = safeJsonParse(payload.name, "name") ?? payload.name;
  payload.biography =
    safeJsonParse(payload.biography, "biography") ?? payload.biography;
  payload.birthPlace =
    safeJsonParse(payload.birthPlace, "birthPlace") ?? payload.birthPlace;
  payload.primaryProfessions =
    safeJsonParse(payload.primaryProfessions, "primaryProfessions") ??
    payload.primaryProfessions;

  if (payload.birthDate === "" || payload.birthDate === "null") {
    payload.birthDate = null;
  }
  if (payload.deathDate === "" || payload.deathDate === "null") {
    payload.deathDate = null;
  }

  return payload;
};

export const peopleController = {
  async getAllPeople(req, res, next) {
    try {
      const { data, pagination } = await peopleService.getAllPeople(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getPersonBySlug(req, res, next) {
    try {
      const data = await peopleService.getPersonBySlug(
        req.params.slug,
        req.query,
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async createPerson(req, res, next) {
    try {
      const payload = parseMultipartBody(req.body);

      if (req.file) {
        payload.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const data = await peopleService.createPerson(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      // در صورت بروز هرگونه خطا، فایل ذخیره شده موقت پاک می‌شود تا سرور زباله‌دانی نشود
      if (req.file) {
        await removeFileSafely(`/uploads/avatars/${req.file.filename}`);
      }
      return next(error);
    }
  },

  async updatePerson(req, res, next) {
    try {
      const payload = parseMultipartBody(req.body);

      if (req.file) {
        payload.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const data = await peopleService.updatePerson(req.params.id, payload);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (req.file) {
        await removeFileSafely(`/uploads/avatars/${req.file.filename}`);
      }
      return next(error);
    }
  },

  async deletePerson(req, res, next) {
    try {
      const data = await peopleService.deletePerson(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },
};
