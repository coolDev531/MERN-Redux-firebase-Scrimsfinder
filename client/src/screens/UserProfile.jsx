// hooks
import { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import useAuth from './../hooks/useAuth';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useQuery from '../hooks/useQuery';
import useAlerts from './../hooks/useAlerts';
import useUsers from './../hooks/useUsers';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Loading from '../components/shared/Loading';
import { InnerColumn } from '../components/shared/PageComponents';
import Tooltip from '../components/shared/Tooltip';
import ScrollToTopOnMount from './../components/shared/ScrollToTopOnMount';
import Sparkles from '../components/shared/effects/Sparkles';
import { Helmet } from 'react-helmet';

// sections
import ChangeBackground from './../components/UserProfile_components/ChangeBackground';
import ProfileAccountDetails from '../components/UserProfile_components/ProfileAccountDetails';
import MyCreatedScrims from './../components/UserProfile_components/MyCreatedScrims';
import UserParticipatedScrims from './../components/UserProfile_components/UserParticipatedScrims';
import SendFriendRequest from './../components/UserProfile_components/SendFriendRequest';
import BanUser from '../components/UserProfile_components/BanUser';
import ProfileImage from '../components/UserProfile_components/ProfileImage';

// services
import {
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
} from '../services/users.services';

// utils
import { makeStyles } from '@mui/styles';

// icons
import VerifiedAdminIcon from '@mui/icons-material/Verified';
import HonorIcon from '@mui/icons-material/MilitaryTech';

export default function UserProfile() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { onlineUsers } = useUsers();
  const [userData, setUserData] = useState(null);
  const [userCreatedScrims, setUserCreatedScrims] = useState([]);
  const [userParticipatedScrims, setUserParticipatedScrims] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userBg, setUserBg] = useState({
    img: null,
    blur: '20px',
  });

  const isOnline = useMemo(
    () => onlineUsers.includes(userData?._id),
    [onlineUsers, userData?._id]
  );

  const classes = useStyles({ isOnline });

  const dispatch = useDispatch();
  const history = useHistory();

  const { name } = useParams();

  const region = useQuery().get('region'); // example: ?region="NA"

  const isCurrentUser = useMemo(
    () => userData?._id === currentUser?._id,
    [currentUser?._id, userData?._id]
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoaded(false);

        const fetchedUserData = await getOneUser(name, region);
        let userId = fetchedUserData._id;

        setUserData(fetchedUserData);

        setUserBg({
          img: fetchedUserData?.profileBackgroundImg ?? 'Summoners Rift',
          blur: fetchedUserData?.profileBackgroundBlur ?? '20',
        });

        // don't fetch userCreatedScrims if user isn't himself
        if (isCurrentUser || isCurrentUserAdmin) {
          const userCreatedScrims = await getUserCreatedScrims(userId);

          setUserCreatedScrims(userCreatedScrims);
        }

        const userScrims = await getUserParticipatedScrims(userId);
        setUserParticipatedScrims(userScrims);

        setIsLoaded(true);
      } catch (error) {
        setCurrentAlert({
          type: 'Error',
          message: (
            <>
              User {name} was not found {region ? `in ${region}` : ''}
            </>
          ),
        });
        history.push('/');
      }
    };

    fetchUserData();

    // eslint-disable-next-line
  }, [name, region, isCurrentUser, isCurrentUserAdmin, history]);

  useLayoutEffect(() => {
    if (!isLoaded) return;

    dispatch({
      type: 'general/setAppBackground',
      payload: userBg.img,
    });

    dispatch({
      type: 'general/setAppBgBlur',
      payload: userBg.blur,
    });

    // eslint-disable-next-line
  }, [isLoaded, userBg]);

  useEffect(() => {
    // when user leaves the page, reset the background and blur to the initial state
    return () => {
      dispatch({
        type: 'general/resetAppBackground',
        payload: 'Summoners Rift',
      });
    };
    // eslint-disable-next-line
  }, []);

  if (!isLoaded) {
    return <Loading text="Loading" />;
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{userData?.name} | Bootcamp LoL Scrim Gym</title>
        <meta
          name="description"
          content={`Visit ${userData?.name}'s Profile at Bootcamp LoL Scrim Gym!`}
        />
      </Helmet>

      <ScrollToTopOnMount />
      <Navbar showLess />
      <InnerColumn>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: 'relative' }}>
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            <ProfileImage
              summonerName={userData?.name}
              region={userData?.region}
            />
            <Typography variant="h1" className="inline-flex">
              <Tooltip
                title={`${userData?.name} is ${
                  isOnline ? 'online' : 'offline'
                }`}>
                <div className={classes.onlineCircle} />
              </Tooltip>

              <Tooltip title={`visit ${userData?.name}'s op.gg`}>
                <a
                  className="link"
                  href={`https://${userData?.region}.op.gg/summoner/userName=${userData?.name}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {userData?.isDonator ? (
                    <Sparkles>{userData?.name}</Sparkles>
                  ) : (
                    userData?.name
                  )}
                </a>
              </Tooltip>
              {userData?.isDonator && (
                <Tooltip
                  placement="top"
                  title={`${userData?.name} helped keep this app alive!`}>
                  <span style={{ cursor: 'help', marginLeft: '8px' }}>
                    <HonorIcon />
                  </span>
                </Tooltip>
              )}

              {userData?.isAdmin && (
                <Tooltip
                  placement="top"
                  title={`${userData?.name} is a verified admin`}>
                  <span style={{ cursor: 'help', marginLeft: '8px' }}>
                    <VerifiedAdminIcon />
                  </span>
                </Tooltip>
              )}
            </Typography>
          </Grid>

          <Grid item>
            {isCurrentUser ? (
              <ChangeBackground
                userBg={userBg}
                userId={userData?._id}
                setUserBg={setUserBg}
              />
            ) : (
              <SendFriendRequest setUser={setUserData} user={userData} />
            )}

            {!isCurrentUser && (
              <BanUser setUser={setUserData} user={userData} />
            )}
          </Grid>
        </Grid>

        {/* User Details: name, discord, rank, exp, etc. */}
        <ProfileAccountDetails
          user={userData}
          setUser={setUserData}
          userParticipatedScrims={userParticipatedScrims}
        />

        {/* My Scrims (will only render if is current user or is admin) */}
        <MyCreatedScrims
          isCurrentUser={isCurrentUser}
          isCurrentUserAdmin={isCurrentUserAdmin}
          user={userData}
          scrims={userCreatedScrims}
        />

        {/* user participated scrims */}
        <UserParticipatedScrims
          user={userData}
          isCurrentUser={isCurrentUser}
          scrims={userParticipatedScrims}
        />
      </InnerColumn>
    </>
  );
}

const useStyles = makeStyles({
  onlineCircle: {
    background: ({ isOnline }) => (isOnline ? '#AAFF00' : '#EE4B2B'),
    marginRight: '10px',
    borderRadius: '50%',
    height: '10px',
    width: '10px',
  },
});
