import { RANK_IMAGES } from './imageMaps';

export const getRankImage = (user) => {
  // replace number with empty string: Diamond 1 => Diamond
  // get rank image from images map by player.rank

  // if just rank provided instead of the whole user object
  if (typeof user === 'string') {
    return RANK_IMAGES[user?.replace(/[^a-z$]/gi, '')];
  }

  return RANK_IMAGES[user?.rank?.replace(/[^a-z$]/gi, '')];
};
