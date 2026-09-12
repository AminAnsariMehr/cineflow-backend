import { mediaService } from "../services/mediaService.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

const sendListResponse = (res, data) =>
  res.status(200).json({
    success: true,
    count: Array.isArray(data) ? data.length : 0,
    data,
  });

export const mediaController = {
  getAllMedia: asyncHandler(async (req, res) => {
    const data = await mediaService.getAllMedia(req.query);
    return sendListResponse(res, data);
  }),

  getMediaBySlug: asyncHandler(async (req, res) => {
    const data = await mediaService.getMediaBySlug(req.params.slug);
    return res.status(200).json({
      success: true,
      data,
    });
  }),

  getTop10: asyncHandler(async (req, res) => {
    const data = await mediaService.getTop10(req.query);
    return sendListResponse(res, data);
  }),

  getTopImdb: asyncHandler(async (req, res) => {
    const data = await mediaService.getTopImdb(req.query);
    return sendListResponse(res, data);
  }),

  getUpcoming: asyncHandler(async (req, res) => {
    const data = await mediaService.getUpcoming(req.query);
    return sendListResponse(res, data);
  }),

  getAnimations: asyncHandler(async (req, res) => {
    const data = await mediaService.getAnimations(req.query);
    return sendListResponse(res, data);
  }),

  getPersianDubbed: asyncHandler(async (req, res) => {
    const data = await mediaService.getPersianDubbed(req.query);
    return sendListResponse(res, data);
  }),
};
