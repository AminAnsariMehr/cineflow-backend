import { actorsRepository } from "../repositories/actorsRepository.js";

export const actorsService = {
  getAllActors: () => actorsRepository.findAll(),
};
