import { MediaCollection } from "#modules/media/models/Collection";
import { normalizePagination } from "#shared/utils/pagination.util";
import { COLLECTION_SUMMARY_PROJECTION } from "#modules/media/repositories/media.projections";

export const collectionRepository = {
  async create(data) {
    const collection = new MediaCollection(data);
    return collection.save();
  },

  async updateById(id, data) {
    return MediaCollection.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  async deleteById(id) {
    return MediaCollection.findByIdAndDelete(id).lean();
  },

  async findById(id) {
    return MediaCollection.findById(id).lean();
  },

  async findBySlug(slug) {
    return MediaCollection.findOne({ slug }).lean();
  },

  async existsByIds(ids = []) {
    if (!ids.length) return true;
    const count = await MediaCollection.countDocuments({ _id: { $in: ids } });
    return count === ids.length;
  },

  async findAll(query = {}) {
    const filter = {};
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      MediaCollection.find(filter)
        .select(COLLECTION_SUMMARY_PROJECTION)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MediaCollection.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },
};
