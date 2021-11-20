import { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// services
import { auth, provider } from '../firebase';
import { loginUser, verifyUser, setAuthToken } from '../services/auth.services';
import { removeToken } from '../services/auth.services';

// utils
import jwt_decode from 'jwt-decode';
import devLog from '../utils/devLog';

export default function useAuth() {
  const auth = useSelector(({ auth }) => auth);

  const isCurrentUserAdmin = useMemo(
    () =>
      auth?.currentUser?.isAdmin ??
      auth?.currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY,
    [auth?.currentUser?.adminKey, auth?.currentUser?.isAdmin]
  );

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
      try {
        const decodedUser = await loginUser(googleParams); // get the jwt token from backend with params

        if (decodedUser) {
          setCurrentUser(decodedUser);
          history.push('/');
        }
      } catch (error) {
        const errorMsg =
          error?.response?.data?.error ??
          'error logging in, please try again later.';

        dispatch({
          type: 'alerts/setCurrentAlert',
          payload: {
            type: 'Error',
            message: errorMsg,
          },
        });
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

    try {
      if (localStorage.jwtToken) {
        // Set auth token header auth
        const token = localStorage.jwtToken;

        const decodedUser = jwt_decode(token);

        setAuthToken(token);

        const data = await verifyUser();

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
    } catch (error) {
      handleLogout();
      dispatch({ type: 'auth/setIsVerifyingUser', payload: false });
    }

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
