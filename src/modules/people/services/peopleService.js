import { peopleRepository } from "../repositories/peopleRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { mediaService } from "../../media/services/mediaService.js";
import {
  toPersonDetailsDto,
  toFilmographyItemDto,
} from "../mappers/peopleMapper.js";

export const peopleService = {
  async getAllPeople(query) {
    const people = await peopleRepository.findAll(query);
    return people.map(toPersonDetailsDto);
  },

  async getPersonBySlug(slug) {
    const person = await peopleRepository.findBySlug(slug);
    if (!person) {
      throw new NotFoundError(`Person with slug '${slug}' not found`);
    }

    const rawFilmography = await mediaService.getFilmographyByPersonId(
      person._id,
    );

    return {
      person: toPersonDetailsDto(person),
      filmography: rawFilmography.map((media) =>
        toFilmographyItemDto(media, person._id),
      ),
    };
  },
};
