import { mediaRepository } from "../repositories/mediaRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { toMediaListDto, toMediaDetailsDto } from "../mappers/mediaMapper.js";

export const mediaService = {
  async getAllMedia(query) {
    const items = await mediaRepository.findAll(query);
    return items.map(toMediaListDto);
  },

  async getMediaBySlug(slug) {
    const item = await mediaRepository.findBySlug(slug);
    if (!item) {
      throw new NotFoundError(`Media with slug '${slug}' not found`);
    }

    let collectionTimeline = [];
    if (item.collectionInfo?.collection?._id) {
      collectionTimeline = await mediaRepository.findCollectionTimeline(
        item.collectionInfo.collection._id,
      );
    }

    return toMediaDetailsDto(item, collectionTimeline);
  },

  async getTop10(query) {
    const items = await mediaRepository.findTop10(query);
    return items.map(toMediaListDto);
  },

  async getTopImdb(query) {
    const items = await mediaRepository.findTopImdb(query);
    return items.map(toMediaListDto);
  },

  async getUpcoming(query) {
    const items = await mediaRepository.findUpcoming(query);
    return items.map(toMediaListDto);
  },

  async getAnimations(query) {
    const items = await mediaRepository.findAnimations(query);
    return items.map(toMediaListDto);
  },

  async getPersianDubbed(query) {
    const items = await mediaRepository.findPersianDubbed(query);
    return items.map(toMediaListDto);
  },

  async getFilmographyByPersonId(personObjectId) {
    return mediaRepository.findFilmographyByPersonId(personObjectId);
  },
};
