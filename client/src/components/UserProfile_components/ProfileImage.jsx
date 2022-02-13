import { useEffect, useState } from 'react';
import { getOPGGData } from '../../services/users.services';
import styled from '@emotion/styled';
import CircularProgress from '@mui/material/CircularProgress';
import FallbackImage from '../../assets/images/user/fallback-user.png';

export default function ProfileImage({ summonerName, region }) {
  const [isLoaded, setLoaded] = useState(false);
  const [image, setImage] = useState('');
  const [border, setBorder] = useState('');
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const fetchImage = async () => {
      const opggData = await getOPGGData(summonerName, region);

      setImage(opggData?.profile_image_url || FallbackImage);
      setBorder(opggData?.solo_tier_info?.border_image_url || '');
      setLevel(opggData?.level || 0);

      setLoaded(true);
    };

    fetchImage();
  }, [summonerName, region]);

  if (!isLoaded) {
    return (
      <div style={{ marginRight: '20px' }}>
        <CircularProgress size={80} />
      </div>
    );
  }

  return (
    <Face
      className="profile-image__face"
      href={`https://${region}.op.gg/summoner/userName=${summonerName}`}
      target="_blank"
      rel="noopener noreferrer">
      <ProfileIconContainer className="profile-image__container">
        <BorderImage className="profile-image__border" borderImage={border} />
        <ProfileIcon
          className="profile-image__icon"
          src={image}
          alt={`${summonerName} summoner icon`}
        />

        <Level>{level}</Level>
      </ProfileIconContainer>
    </Face>
  );
}

const Face = styled.a`
  display: inline-block;
  width: 100px;
  vertical-align: top;
  margin-left: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  cursor: pointer;
`;

const ProfileIconContainer = styled.div`
  position: relative;
`;

const BorderImage = styled.div`
  position: absolute;
  left: -10px;
  top: -10px;
  width: 120px;
  height: 120px;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-image: ${({ borderImage }) => `url(${borderImage})`};
`;

const ProfileIcon = styled.img`
  display: block;
  width: 100px;
  height: 100px;
  border: 0px;
  vertical-align: middle;
  max-width: 100%;
`;

const Level = styled.span`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: -14px;
  margin-left: -22px;
  width: 44px;
  height: 24px;
  padding-top: 3px;
  box-sizing: border-box;
  line-height: 17px;
  font-family: Helvetica, AppleSDGothic, 'Apple SD Gothic Neo', AppleGothic,
    Arial, Tahoma;
  font-size: 14px;
  text-align: center;
  color: rgb(234, 189, 86);
  background: url(https://s-lol-web.op.gg/static/images/site/summoner/bg-levelbox.png)
    0% 0% / 100%;
`;
