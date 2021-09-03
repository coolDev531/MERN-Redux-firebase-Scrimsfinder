import { useState, createContext, useEffect } from 'react';
import { verifyUser } from '../services/auth';
import { useHistory, useLocation } from 'react-router-dom';
import { auth } from '../firebase';

const CurrentUserContext = createContext();

function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    return user !== null ? user : null;
  });

  const { pathname } = useLocation();

  const history = useHistory();

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // verify user details in mongodb database.
  useEffect(() => {
    const handleVerifyUser = async () => {
      let googleParams = {
        uid: currentUser?.uid, // google id
        email: currentUser?.email,
      };

      // back-end is taking google data and checking if it exists.
      const verifiedUser = await verifyUser(googleParams);

      if (verifiedUser) {
        setCurrentUser(verifiedUser);
      } else {
        setCurrentUser(null);
        history.push('/user-setup');
      }
    };
    handleVerifyUser();
  }, [history, currentUser?.uid, currentUser?.email]);

  //  check if user is signed in with google (verification)
  useEffect(() => {
    // don't do this at login because it will push to home after signing in with google.
    if (pathname.includes('/user-setup')) return;

    if (!currentUser?._id ?? false) return; // don't continue if user didn't sign up or in yet.

    auth.onAuthStateChanged(async (gmailData) => {
      if (gmailData) {
        // User is signed in with google.
        setCurrentUser((prevState) => ({
          ...prevState,
          email: gmailData.email,
          uid: gmailData.uid,
        }));
      } else {
        setCurrentUser(null);
        history.push('/user-setup');
        // No user is signed in with google.
      }
    });

    //eslint-disable-next-line
  }, []);

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
