import { peopleRepository } from "../repositories/peopleRepository.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import { buildPaginationMeta } from "#shared/utils/pagination.util";
import { mediaService } from "../../media/services/mediaService.js";
import { toPersonDetailsDto } from "../mappers/peopleMapper.js";

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
};
