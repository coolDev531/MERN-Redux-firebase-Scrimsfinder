import { useState, useEffect, useMemo } from 'react';
import useAuth from './../hooks/useAuth';
import { useParams, useHistory } from 'react-router-dom';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Typography from '@mui/material/Typography';
import Loading from '../components/shared/Loading';
import { InnerColumn } from '../components/shared/PageComponents';
import Tooltip from '../components/shared/Tooltip';
import ScrollToTopOnMount from './../components/shared/ScrollToTopOnMount';
import { Helmet } from 'react-helmet';

// sections
import ProfileAccountDetails from '../components/UserProfile_components/ProfileAccountDetails';
import MyCreatedScrims from './../components/UserProfile_components/MyCreatedScrims';

// services
import {
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
} from '../services/users';

import VerifiedAdminIcon from '@mui/icons-material/VerifiedUser';

export default function UserProfile() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userCreatedScrims, setUserCreatedScrims] = useState([]);
  const [userParticipatedScrims, setUserParticipatedScrims] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { id } = useParams();
  const history = useHistory();

  const isCurrentUser = useMemo(
    () => userData?._id === currentUser?._id,
    [currentUser?._id, userData?._id]
  );

  const titleText = useMemo(() => {
    // if the user in the page is the current user, say "My Profile"
    if (isCurrentUser) return 'My Profile';
    return `${userData?.name}'s Profile`; // else say "Bob's  Profile" or whatever
  }, [isCurrentUser, userData?.name]);

  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedUserData = await getOneUser(id);
      setUserData(fetchedUserData);

      // don't fetch userCreatedScrims if user isn't an admin and isn't himself
      if (isCurrentUserAdmin && isCurrentUser) {
        const userCreatedScrims = await getUserCreatedScrims(id);
        setUserCreatedScrims(userCreatedScrims);
      }

      const userScrims = await getUserParticipatedScrims(id);
      setUserParticipatedScrims(userScrims);

      setIsLoaded(true);
    };

    fetchUserData();
  }, [id, isCurrentUser, isCurrentUserAdmin]);

  if (!isLoaded) {
    return <Loading text="Loading..." />;
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
      <Navbar showLess onClickBack={() => history.push('/')} />
      <InnerColumn>
        <Typography variant="h1">
          <Tooltip title={`visit ${userData?.name}'s op.gg`}>
            <a
              className="link"
              href={`https://${userData?.region}.op.gg/summoner/userName=${userData?.name}`}
              target="_blank"
              rel="noopener noreferrer">
              {titleText}
            </a>
          </Tooltip>
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

        {/* User Details: name, discord, rank, exp, etc. */}
        <ProfileAccountDetails
          user={userData}
          userParticipatedScrims={userParticipatedScrims}
        />

        {/* My Scrims (will only render if is current user) */}
        <MyCreatedScrims
          isCurrentUser={isCurrentUser}
          scrims={userCreatedScrims}
        />
      </InnerColumn>
    </>
  );
}
