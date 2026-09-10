export const toMediaListDto = (doc) => ({
  id: doc.id,
  slug: doc.slug,
  type: doc.type,
  title: doc.title,
  originalTitle: doc.originalTitle,
  releaseYear: doc.releaseYear,
  runtime: doc.runtime,
  genres: doc.genres || [],
  countries: doc.countries || [],
  languages: doc.languages || [],
  poster: doc.poster,
  rating: doc.rating,
  isTop10: Boolean(doc.isTop10),
  isUpcoming: Boolean(doc.isUpcoming),
});

export const toMediaDetailsDto = (doc) => {
  const { _id, __v, ...rest } = doc;
  return {
    ...rest,
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
  };
};
