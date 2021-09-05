import { useState, createContext, useEffect } from 'react';
import { verifyUser } from '../services/auth';
import { useHistory } from 'react-router-dom';
import { auth } from '../firebase';

const CurrentUserContext = createContext();

function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // verify user details in mongodb database.
  // useEffect(() => {
  //   const handleVerifyUser = async () => {
  //     let googleParams = {
  //       uid: currentUser?.uid, // google id
  //       email: currentUser?.email,
  //     };

  //     // back-end is taking google data and checking if it exists.
  //     const verifiedUser = await verifyUser(googleParams);

  //     if (verifiedUser) {
  //       setCurrentUser(verifiedUser);
  //     } else {
  //       setCurrentUser(null);
  //       history.push('/user-setup');
  //     }
  //   };
  //   handleVerifyUser();
  // }, [history, currentUser?.uid, currentUser?.email]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (googleUser) => {
      let googleParams = {
        uid: googleUser?.uid, // google id
        email: googleUser?.email,
      };

      // back-end is taking google data and checking if it exists.
      const verifiedUser = await verifyUser(googleParams);
      setCurrentUser(verifiedUser);
      setLoading(false);
    });

    return () => {
      console.log('UNSUBSCRIBE');
      unsubscribe();
    };
  }, []);

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {!loading && children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
