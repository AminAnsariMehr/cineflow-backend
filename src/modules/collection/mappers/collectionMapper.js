export const toCollectionDto = (collection) => {
  if (!collection) return null;

  return {
    id: collection._id,
    slug: collection.slug,
    title: collection.title,
    originalTitle: collection.originalTitle,
    summary: collection.summary,
    type: collection.type,
    assets: collection.assets,
    isFeatured: collection.isFeatured,
    featuredOrder: collection.featuredOrder,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
};
