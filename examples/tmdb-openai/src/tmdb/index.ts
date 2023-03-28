import { Service } from '../../../../build/main';

import { getMovieDetails } from './getMovieDetails';
import { searchMovies } from './searchMovies';

export const tmdbService = new Service('tmdb', 'The Movie Database', [
  'Movies',
  'TV Shows',
  'Streaming',
  'Reviews',
  'API',
  'Actors',
  'Actresses',
  'Photos',
  'User Ratings',
  'Synopsis',
  'Trailers',
  'Teasers',
  'Credits',
  'Cast',
])
  .registerMethod('searchMovies', searchMovies)
  .registerMethod('getMovieDetails', getMovieDetails);
