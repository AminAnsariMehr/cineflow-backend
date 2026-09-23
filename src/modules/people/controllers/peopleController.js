import { peopleService } from "../services/peopleService.js";
import { BadRequestError } from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";
import { normalizePersonalRelationships } from "../utils/relationship.util.js";

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

  const jsonFields = [
    "name",
    "biography",
    "birthPlace",
    "primaryProfessions",
    "awardsSummary",
    "personalRelationships",
    "images",
  ];

  for (const field of jsonFields) {
    if (payload[field] !== undefined) {
      payload[field] = safeJsonParse(payload[field], field) ?? payload[field];
    }
  }

  if (payload.images !== undefined) {
    if (!Array.isArray(payload.images)) {
      throw new BadRequestError("'images' must be an array of strings.");
    }
    if (payload.images.length > 5) {
      throw new BadRequestError("The images gallery cannot exceed 5 items.");
    }
  }

  if (payload.personalRelationships !== undefined) {
    payload.personalRelationships = normalizePersonalRelationships(
      payload.personalRelationships,
    );
  }

  if (payload.birthDate === "" || payload.birthDate === "null") {
    payload.birthDate = null;
  }
  if (payload.deathDate === "" || payload.deathDate === "null") {
    payload.deathDate = null;
  }

  if (payload.height !== undefined && payload.height !== "") {
    payload.height = payload.height === "null" ? null : Number(payload.height);
  }
  if (payload.starmeterRank !== undefined && payload.starmeterRank !== "") {
    payload.starmeterRank =
      payload.starmeterRank === "null" ? null : Number(payload.starmeterRank);
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
      const data = await peopleService.getPersonBySlug(req.params.slug);
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
