import { Method } from 'chatrpc';
import { MovieDb, MovieResponse } from 'moviedb-promise';

export const getMovieDetails = new Method<string, MovieResponse>({
  handler: async (input) => {
    const moviedb = new MovieDb(process.env.TMDB_ACCESS_TOKEN ?? '');
    const res = await moviedb.movieInfo(input);
    return res;
  },
  input: {
    type: 'string',
    description:
      'The TMDB ID for a movie. If you are unsure of the ID, use the searchMovies method.',
  },
  output: {
    type: 'object',
    properties: {
      adult: { type: 'boolean' },
      backdrop_path: { type: 'string' },
      belongs_to_collection: { type: 'any' },
      budget: { type: 'number' },
      genres: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
      },
      homepage: { type: 'string' },
      id: { type: 'number' },
      imdb_id: { type: 'string' },
      original_language: { type: 'string' },
      original_title: { type: 'string' },
      overview: { type: 'string' },
      popularity: { type: 'number' },
      poster_path: { type: 'string' },
      production_companies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            logo_path: { type: 'string' },
            name: { type: 'string' },
            origin_country: { type: 'string' },
          },
        },
      },
      production_countries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            iso_3166_1: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      release_date: { type: 'string' },
      revenue: { type: 'number' },
      runtime: { type: 'number' },
      spoken_languages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            iso_639_1: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      status: {
        type: 'string',
        enum: [
          'Rumored',
          'Planned',
          'In Production',
          'Post Production',
          'Released',
          'Canceled',
        ],
      },
      tagline: { type: 'string' },
      title: { type: 'string' },
      video: { type: 'boolean' },
      vote_average: { type: 'number' },
      vote_count: { type: 'number' },
    },
  },
});
