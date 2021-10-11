// roles imports
import topLaneImg from '../assets/images/roles/toplane.png';
import jungleImg from '../assets/images/roles/jungle.png';
import midLaneImg from '../assets/images/roles/midlane.png';
import adcImg from '../assets/images/roles/adc.png';
import supportImg from '../assets/images/roles/support.png';

// ranks imports
import unrankedImg from '../assets/images/ranks/unranked.png';
import ironImg from '../assets/images/ranks/iron.png';
import bronzeImg from '../assets/images/ranks/bronze.png';
import silverImg from '../assets/images/ranks/silver.png';
import goldImg from '../assets/images/ranks/gold.png';
import platImg from '../assets/images/ranks/platinum.png';
import diamondImg from '../assets/images/ranks/diamond.png';
import masterImg from '../assets/images/ranks/master.png';
import grandmasterImg from '../assets/images/ranks/grandmaster.png';
import challengerImg from '../assets/images/ranks/challenger.png';

// bg images
import anniversaryImg from '../assets/images/backgrounds/happy_team.jpg';
import summonersRiftImg from '../assets/images/backgrounds/summoners_rift.jpg';

export const ROLE_IMAGES = {
  Top: topLaneImg,
  Jungle: jungleImg,
  Mid: midLaneImg,
  ADC: adcImg,
  Support: supportImg,
};

export const RANK_IMAGES = {
  Unranked: unrankedImg,
  Iron: ironImg,
  Bronze: bronzeImg,
  Silver: silverImg,
  Gold: goldImg,
  Platinum: platImg,
  Diamond: diamondImg,
  Master: masterImg,
  Grandmaster: grandmasterImg,
  Challenger: challengerImg,
};

export const BG_IMAGES = {
  Anniversary: `url(${anniversaryImg})`,
  'Summoners Rift': `url(${summonersRiftImg})`,
};
