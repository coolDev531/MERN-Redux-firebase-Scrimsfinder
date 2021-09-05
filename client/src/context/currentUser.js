import { useState, createContext, useEffect, useContext } from 'react';
import { verifyUser, setAuthToken } from '../services/auth';
import { auth } from '../firebase';
import jwt_decode from 'jwt-decode';

const CurrentUserContext = createContext();

export const useAuth = () => useContext(CurrentUserContext);

function CurrentUserProvider({ children }) {
  // we really don't need useReducer for this.
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // we can't do it this way, need a custom way.
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged(async (googleUser) => {
  //     let googleParams = {
  //       uid: googleUser?.uid, // google id
  //       email: googleUser?.email,
  //     };

  //     // back-end is taking google data and checking if it exists.
  //     const verifiedUser = await verifyUser(googleParams);
  //     setCurrentUser(verifiedUser);
  //     setLoading(false);
  //   });
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  const logOutUser = () => {
    auth.signOut();
    localStorage.removeItem('jwtToken');
    setAuthToken(false);
    setCurrentUser(null);
  };

  useEffect(() => {
    // Check for token to keep user logged in
    console.log({ localStorage });
    if (localStorage.jwtToken) {
      // Set auth token header auth
      const token = localStorage.jwtToken;
      setAuthToken(token);
      console.log({ token });
      // Decode token and get user info and exp
      const decodedUser = jwt_decode(token);
      // Set user and isAuthenticated
      console.log({ decodedUser });

      setCurrentUser(decodedUser);
      // Check for expired token
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decodedUser.exp < currentTime) {
        // if time passed expiration
        // Logout user
        logOutUser();
        // Redirect to login
        window.location.href = './user-setup';
      }
    }
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, loading, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
