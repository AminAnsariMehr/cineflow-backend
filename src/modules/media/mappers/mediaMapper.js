export const toMediaListDto = (doc) => ({
  id: doc.id,
  slug: doc.slug,
  type: doc.type,
  title: doc.title,
  originalTitle: doc.originalTitle,
  releaseYear: doc.releaseYear,
  ageRating: doc.ageRating || null,
  duration: doc.type === "movie" ? doc.duration : null,
  genres: doc.genres || [],
  countries: doc.countries || [],
  languages: doc.languages || [],
  assets: doc.assets,
  poster: doc.assets?.poster || doc.poster || null,
  rating: doc.rating,
  seriesDetails: doc.type === "series" ? doc.seriesDetails : undefined,
  isTop10: Boolean(doc.isTop10),
  isUpcoming: Boolean(doc.isUpcoming),
});

export const toMediaDetailsDto = (doc) => {
  const { _id, __v, ...rest } = doc;

  return {
    ...rest,
    duration: doc.type === "movie" ? doc.duration : undefined,
    seriesDetails: doc.type === "series" ? doc.seriesDetails : undefined,
    // poster: doc.assets?.poster || doc.poster || null,
    credits: {
      cast: (doc.credits?.cast || []).map((c) => ({
        character: c.character,
        order: c.order,
        person: c.person
          ? {
              id: c.person.id,
              slug: c.person.slug,
              name: c.person.name,
              avatar: c.person.avatar,
            }
          : null,
      })),

      directors: (doc.credits?.directors || []).map((d) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        avatar: d.avatar,
      })),

      writers: (doc.credits?.writers || []).map((w) => ({
        id: w.id,
        slug: w.slug,
        name: w.name,
        avatar: w.avatar,
      })),
    },
    collectionTimeline,
  };
};
