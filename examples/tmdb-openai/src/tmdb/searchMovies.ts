import { Method } from 'chatrpc';
import {
  MovieDb,
  MovieResultsResponse,
  SearchMovieRequest,
} from 'moviedb-promise';

export const searchMovies = new Method<
  SearchMovieRequest,
  MovieResultsResponse
>(
  {
    type: 'object',
    properties: {
      query: { type: 'string' },
      page: { type: 'number' },
      include_adult: { type: 'boolean' },
      year: { type: 'number' },
      primary_release_year: { type: 'number' },
    },
    required: ['query'],
  },
  {
    type: 'object',
    properties: {
      page: { type: 'number' },
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            poster_path: { type: 'string' },
            adult: { type: 'boolean' },
            overview: { type: 'string' },
            release_date: { type: 'string' },
            genre_ids: { type: 'array', items: { type: 'number' } },
            id: { type: 'number' },
            media_type: { type: 'string' },
            original_language: { type: 'string' },
            title: { type: 'string' },
            backdrop_path: { type: 'string' },
            popularity: { type: 'number' },
            vote_count: { type: 'number' },
            video: { type: 'boolean' },
            vote_average: { type: 'number' },
          },
        },
      },
      total_pages: { type: 'number' },
      total_results: { type: 'number' },
    },
    required: ['page', 'results', 'total_pages', 'total_results'],
  },
  async (input) => {
    const moviedb = new MovieDb(process.env.TMDB_ACCESS_TOKEN ?? '');
    const res = await moviedb.searchMovie(input);
    return {
      page: res.page,
      results: res.results?.slice(0, 10) ?? [],
      total_pages: res.total_pages,
      total_results: res.total_results,
    };
  },
  'This functions allows users to search for movies.'
);
