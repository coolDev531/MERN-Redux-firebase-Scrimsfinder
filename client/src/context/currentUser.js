import {
  useState,
  createContext,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { setAuthToken, removeToken, verifyUser } from '../services/auth';
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
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const logOutUser = useCallback(async () => {
    devLog('logging out...');
    auth.signOut();
    localStorage.removeItem('jwtToken'); // remove token from localStorage
    removeToken();
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
      const decodedUser = await loginUser(googleParams); // get the jwt token from backend with params
      if (decodedUser) {
        setCurrentUser(decodedUser);
        history.push('/');
      }
    }
  };

  // HANDLE VERIFY
  useEffect(() => {
    const handleVerify = async () => {
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

        // if there is no token PrivateRoute.jsx should send us to /user-setup automatically.
        if (data?.token) {
          localStorage.setItem('jwtToken', data?.token);
          // Set user
          setCurrentUser(data?.user);

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
      }
      setLoading(false);
    };
    handleVerify();

    return () => {
      handleVerify();
    };
    //eslint-disable-next-line
  }, []);

  let value = {
    currentUser,
    setCurrentUser,
    logOutUser,
    logInUser,
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {/* don't render children if loading */}
      {!loading && children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
