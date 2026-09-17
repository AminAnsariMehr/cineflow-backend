import { peopleRepository } from "../repositories/peopleRepository.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "#shared/errors/AppError.js";
import { buildPaginationMeta } from "#shared/utils/pagination.util.js";
import { mediaService } from "../../media/services/mediaService.js";
import { toPersonDetailsDto } from "../mappers/peopleMapper.js";
import { removeFileSafely } from "#shared/utils/file.util.js";

const normalizeSlug = (slug) => {
  if (typeof slug !== "string") return "";
  return slug.trim().toLowerCase();
};

export const peopleService = {
  async getAllPeople(query = {}) {
    const { items, totalItems, page, limit } =
      await peopleRepository.findAll(query);

    return {
      data: items.map(toPersonDetailsDto).filter(Boolean),
      pagination: buildPaginationMeta(totalItems, page, limit),
    };
  },

  async getPersonBySlug(slug, query = {}) {
    const normalizedSlug = normalizeSlug(slug);

    if (!normalizedSlug) {
      throw new BadRequestError(
        "Person slug is required and must be a valid string",
      );
    }

    const person = await peopleRepository.findBySlug(normalizedSlug);

    if (!person) {
      throw new NotFoundError(`Person with slug '${normalizedSlug}' not found`);
    }

    const filmography = await mediaService.getFilmographyByPersonId(
      person._id,
      query,
    );

    return {
      person: toPersonDetailsDto(person),
      filmography,
    };
  },

  async createPerson(payload) {
    const slug = normalizeSlug(payload.slug);
    if (!slug) {
      throw new BadRequestError("Valid slug is required");
    }

    const existingPerson = await peopleRepository.findBySlug(slug);
    if (existingPerson) {
      throw new ConflictError(`Person with slug '${slug}' already exists`);
    }

    const newPerson = await peopleRepository.create({
      ...payload,
      slug,
    });

    return toPersonDetailsDto(newPerson);
  },

  async updatePerson(id, payload) {
    if (!id) throw new BadRequestError("Person ID is required");

    if (payload.slug) {
      payload.slug = normalizeSlug(payload.slug);
      const existingPerson = await peopleRepository.findBySlug(payload.slug);
      if (existingPerson && String(existingPerson._id) !== String(id)) {
        throw new ConflictError(`Slug '${payload.slug}' is already taken`);
      }
    }

    let oldAvatar = null;

    if (payload.avatar) {
      const currentPerson = await peopleRepository.findById(id);
      if (currentPerson) oldAvatar = currentPerson.avatar;
    }

    const updatedPerson = await peopleRepository.updateById(id, payload);
    if (!updatedPerson) {
      throw new NotFoundError(`Person with id '${id}' not found`);
    }

    if (oldAvatar && payload.avatar && oldAvatar !== payload.avatar) {
      await removeFileSafely(oldAvatar);
    }

    return toPersonDetailsDto(updatedPerson);
  },

  async deletePerson(id) {
    if (!id) throw new BadRequestError("Person ID is required");

    const deletedPerson = await peopleRepository.deleteById(id);
    if (!deletedPerson) {
      throw new NotFoundError(`Person with id '${id}' not found`);
    }

    if (deletedPerson.avatar) {
      await removeFileSafely(deletedPerson.avatar);
    }

    return { id };
  },
};
