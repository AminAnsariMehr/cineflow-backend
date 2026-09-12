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
  poster: doc.assets?.poster?.vertical || doc.assets?.poster || null,
  rating: doc.rating,
  seriesDetails: doc.type === "series" ? doc.seriesDetails : null,
  isTop10: Boolean(doc.isTop10),
  isUpcoming: Boolean(doc.isUpcoming),
  isExclusive: Boolean(doc.isExclusive),
});

export const toMediaDetailsDto = (doc, collectionTimeline = []) => {
  const { _id, __v, ...rest } = doc;

  return {
    ...rest,
    duration: doc.type === "movie" ? doc.duration : null,
    seriesDetails: doc.type === "series" ? doc.seriesDetails : null,
    poster: doc.assets?.poster?.vertical || doc.assets?.poster || null,
    credits: {
      cast: (doc.credits?.cast || [])
        .filter((c) => c && c.person && typeof c.person === "object")
        .map((c) => ({
          character: c.character,
          order: c.order,
          person: {
            id: c.person.id,
            slug: c.person.slug,
            name: c.person.name,
            avatar: c.person.avatar,
          },
        })),

      directors: (doc.credits?.directors || [])
        .filter((d) => d && typeof d === "object" && d.slug)
        .map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          avatar: d.avatar,
        })),

      writers: (doc.credits?.writers || [])
        .filter((w) => w && typeof w === "object" && w.slug)
        .map((w) => ({
          id: w.id,
          slug: w.slug,
          name: w.name,
          avatar: w.avatar,
        })),
    },
    collectionTimeline,
  };
};
