import { Service } from 'chatrpc';

import { getMovieDetails } from './getMovieDetails';
import { searchMovies } from './searchMovies';

export const tmdbService = new Service({
  name: 'tmdb',
  description: 'The Movie Database',
  keywords: [
    'Movies',
    'TV Shows',
    'Streaming',
    'Reviews',
    'Actors',
    'Actresses',
    'User Ratings',
    'Cast',
  ],
})
  .registerMethod('searchMovies', searchMovies)
  .registerMethod('getMovieDetails', getMovieDetails);
