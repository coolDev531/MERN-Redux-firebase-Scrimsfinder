import {
  useState,
  createContext,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { setAuthToken } from '../services/auth';
import { auth, provider } from '../firebase';
import { useHistory } from 'react-router-dom';

import { loginUser } from './../services/auth';
import jwt_decode from 'jwt-decode';
import devLog from './../utils/devLog';

const CurrentUserContext = createContext();

export const useAuth = () => useContext(CurrentUserContext);

function CurrentUserProvider({ children }) {
  // we really don't need useReducer for this.
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  const logOutUser = useCallback(async () => {
    devLog('logging out...');
    auth.signOut();
    localStorage.removeItem('jwtToken'); // remove token from localStorage
    setAuthToken(false);
    setCurrentUser(null); // set user to null.
    history.push('./user-setup'); // push back to signup
  }, [history]);

  const logInUser = async () => {
    devLog('logging in...');

    // verifying user with google, then getting rest of data.
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      let googleParams = {
        uid: result.user.uid, // google id
        email: result.user.email,
      };

      // token = `Bearer ${bcryptHash}`
      const data = await loginUser(googleParams); // get the jwt token from backend with params
      if (data?.token) {
        const { token } = data;
        localStorage.setItem('jwtToken', token); // add token to back-end
        setAuthToken(token); // add authorization in the request to be bearer token.
        const decodedUser = jwt_decode(token); // decode user by hashed uid that was hashed in back-end
        setCurrentUser(decodedUser);
        history.push('/');
      }
    }
  };

  // HANDLE VERIFY
  // this runs on every mount  / refresh
  // verify user every mount and refresh
  useEffect(() => {
    // Check for token to keep user logged in
    if (localStorage.jwtToken) {
      // Set auth token header auth
      const token = localStorage.jwtToken;
      setAuthToken(token);

      // Decode token and get user info and exp
      const decodedUser = jwt_decode(token);

      // Set user
      setCurrentUser(decodedUser);

      // Check for expired token
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decodedUser.exp < currentTime) {
        // if time passed expiration
        // Logout user
        logOutUser();
        // Redirect to login
        history.push('./user-setup');
      }
    }
  }, [history, logOutUser]);

  let value = {
    currentUser,
    setCurrentUser,

    logOutUser,
    logInUser,
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
