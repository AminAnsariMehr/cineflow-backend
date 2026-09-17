import { peopleService } from "../services/peopleService.js";

const parseMultipartBody = (body) => {
  const payload = { ...body };
  const jsonFields = ["name", "biography", "birthPlace", "primaryProfessions"];

  for (const field of jsonFields) {
    if (typeof payload[field] === "string") {
      try {
        payload[field] = JSON.parse(payload[field]);
      } catch {
        // اگر فرمت جیسون نبود (مثلاً استرینگ ساده بود)، دست‌نخورده باقی می‌ماند
      }
    }
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

      // اگر فایل آپلود شده بود، آدرس نسبی ذخیره شده را درون فیلد avatar می‌گذاریم
      if (req.file) {
        payload.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const data = await peopleService.createPerson(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async updatePerson(req, res, next) {
    try {
      const payload = parseMultipartBody(req.body);

      // در آپدیت: اگر عکس جدید آپلود شده بود جایگزین می‌شود
      if (req.file) {
        payload.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const data = await peopleService.updatePerson(req.params.id, payload);
      return res.status(200).json({ success: true, data });
    } catch (error) {
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
