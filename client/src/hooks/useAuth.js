import { useCallback, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useEffectExceptOnMount from './useEffectExceptOnMount';

// services
import { auth, provider } from '../firebase';
import { loginUser, verifyUser } from '../services/auth.services';
import { setAuthToken, removeToken } from '../services/auth.services';
import { getUserNotifications } from '../services/users.services';

// utils
import jwt_decode from 'jwt-decode';
import devLog from '../utils/devLog';

export default function useAuth() {
  const auth = useSelector(({ auth }) => auth);

  const isCurrentUserAdmin =
    auth?.currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY;
  return { ...auth, isCurrentUserAdmin };
}

export function useAuthActions() {
  const history = useHistory();
  const dispatch = useDispatch();

  const setCurrentUser = (currentUserValue) => {
    dispatch({ type: 'auth/setCurrentUser', payload: currentUserValue });
  };

  const handleLogout = async () => {
    devLog('logging out...');
    auth.signOut();
    localStorage.removeItem('jwtToken'); // remove token from localStorage
    removeToken();
    dispatch({ type: 'auth/logout' });
    history.push('/signup'); // push back to signup
  };

  const handleLogin = async () => {
    devLog('logging in...');

    // verifying user with google, then getting rest of data.
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      let googleParams = {
        uid: result.user.uid, // google id
        email: result.user.email,
      };

      // token = `Bearer ${bcryptHash}`
      const decodedUser = await loginUser(googleParams); // get the jwt token from backend with params

      if (decodedUser) {
        setCurrentUser(decodedUser);
        history.push('/');
      }
    }
  };

  return { handleLogin, handleLogout, setCurrentUser };
}

export function useAuthVerify() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { handleLogout, setCurrentUser } = useAuthActions();

  const handleVerify = useCallback(async () => {
    devLog('verifying user');
    if (localStorage.jwtToken) {
      // Set auth token header auth
      const token = localStorage.jwtToken;
      setAuthToken(token);

      const decodedUser = jwt_decode(token);

      const data = await verifyUser({
        uid: decodedUser?.uid,
        email: decodedUser?.email,
      });

      // if there is no token PrivateRoute.jsx should send us to /sign-up automatically.
      if (data?.token) {
        localStorage.setItem('jwtToken', data?.token);
        // Set user
        setCurrentUser(data?.user);
        // Check for expired token
        const currentTime = Date.now() / 1000; // to get in milliseconds
        if (decodedUser.exp < currentTime) {
          // if time passed expiration
          // Logout user
          handleLogout();
          // Redirect to login
          history.push('/signup');
        }
      }
    }
    dispatch({ type: 'auth/setIsVerifyingUser', payload: false });

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    handleVerify();
    return () => {
      handleVerify();
    };

    // handleVerify is wrapped in usecallback so it's okay
  }, [handleVerify]);

  return null;
}

export const useRefreshNotifications = () => {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const refreshUserNotifications = useCallback(async () => {
    if (!currentUser?._id) return;
    devLog('checking notifications for currentUser');

    const { notifications } = await getUserNotifications(currentUser?._id);

    // if notifications from api are different, that means there are new notifications
    if (notifications.length !== currentUser.notifications?.length) {
      // update the user in the state
      dispatch({ type: 'auth/updateCurrentUser', payload: { notifications } });
    }
  }, [currentUser, dispatch]);

  // check for new notifications every time pathname change,
  // add them to the user in the state.
  useEffectExceptOnMount(() => {
    refreshUserNotifications();
  }, [pathname]);
};
