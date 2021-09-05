import { useState, createContext, useEffect } from 'react';
import { verifyUser } from '../services/auth';
import { auth } from '../firebase';

const CurrentUserContext = createContext();

function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

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
