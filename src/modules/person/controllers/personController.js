import { personService } from "../services/personService.js";
import { BadRequestError } from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";
import { normalizePersonalRelationships } from "../utils/relationship.util.js";
import { mediaService } from "../../media/services/mediaService.js";

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

const parseNumericField = (value, fieldName) => {
  if (value === undefined || value === "") return undefined;
  if (value === null || value === "null") return null;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new BadRequestError(`Field '${fieldName}' must be a valid number.`);
  }
  return parsed;
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

  payload.height = parseNumericField(payload.height, "height");
  payload.starmeterRank = parseNumericField(
    payload.starmeterRank,
    "starmeterRank",
  );

  return payload;
};

export const personController = {
  async getAllPerson(req, res, next) {
    try {
      const { data, pagination } = await personService.getAllPerson(req.query);
      return res.status(200).json({ success: true, data, pagination });
    } catch (error) {
      return next(error);
    }
  },

  async getPersonByIdentifier(req, res, next) {
    try {
      const data = await personService.getPersonByIdentifier(
        req.params.identifier,
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async createPerson(req, res, next) {
    let uploadedFilePath = null;
    try {
      if (req.file) {
        uploadedFilePath = `/uploads/avatars/${req.file.filename}`;
      }

      const payload = parseMultipartBody(req.body);

      if (uploadedFilePath) {
        payload.avatar = uploadedFilePath;
      }

      const data = await personService.createPerson(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      if (uploadedFilePath) {
        await removeFileSafely(uploadedFilePath);
      }
      return next(error);
    }
  },

  async updatePerson(req, res, next) {
    let uploadedFilePath = null;
    try {
      if (req.file) {
        uploadedFilePath = `/uploads/avatars/${req.file.filename}`;
      }

      const payload = parseMultipartBody(req.body);

      if (uploadedFilePath) {
        payload.avatar = uploadedFilePath;
      }

      const data = await personService.updatePerson(req.params.id, payload);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (uploadedFilePath) {
        await removeFileSafely(uploadedFilePath);
      }
      return next(error);
    }
  },

  async deletePerson(req, res, next) {
    try {
      const data = await personService.deletePerson(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async getPersonMedia(req, res, next) {
    try {
      const { imdbId } = req.params;
      const { data, pagination } =
        await mediaService.getFilmographyByPersonImdbId(imdbId, req.query);

      return res.status(200).json({
        success: true,
        data,
        pagination,
      });
    } catch (error) {
      return next(error);
    }
  },
};
