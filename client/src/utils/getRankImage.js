import { RANK_IMAGES } from './imageMaps';

export const getRankImage = (user) => {
  // replace number with empty string: Diamond 1 => Diamond
  // get rank image from images map by player.rank
  return RANK_IMAGES[user?.rank?.replace(/[^a-z$]/gi, '')];
};
