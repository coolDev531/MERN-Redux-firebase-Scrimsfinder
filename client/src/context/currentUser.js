import React, { useState, createContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { auth, provider } from '../firebase';

const CurrentUserContext = createContext();

function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    return user ? user : null;
  });

  const { pathname } = useLocation();
  const history = useHistory();

  const setGoogleUser = (user) => {
    setCurrentUser((prevState) => ({
      ...prevState,
      email: user?.email,
      photo: user?.photoURL,
    }));
  };

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // this is so clunky...
  // useEffect(() => {
  //   if (pathname !== '/user-setup') {
  //     auth.onAuthStateChanged(async (user) => {
  //       if (user) {
  //         setGoogleUser(user);
  //         console.log('auth change');
  //         history.push('/scrims');
  //       }
  //     });
  //   }
  //   // eslint-disable-next-line
  // }, [currentUser?.email, pathname]);

  const handleSignOut = () => {
    console.log('signing out');
    setCurrentUser(null);
  };

  const handleAuth = async () => {
    let googleName = currentUser?.googleName;

    if (!googleName) {
      // SIGN IN
      try {
        const result = auth.signInWithPopup(provider);
        if (result.user) setGoogleUser(result.user);
      } catch (error) {
        throw error;
      }
    } else if (googleName) {
      // SIGN OUT
      try {
        auth.signOut();
        handleSignOut();
        history.push('/');
      } catch (error) {
        throw error;
      }
    }
  };

  return (
    <CurrentUserContext.Provider
      value={[currentUser, setCurrentUser, handleAuth]}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
