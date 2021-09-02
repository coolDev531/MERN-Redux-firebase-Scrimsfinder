import { useState, createContext, useEffect } from 'react';
import { verifyUser } from '../services/auth';
import { useHistory } from 'react-router-dom';

const CurrentUserContext = createContext();

function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    return user !== null ? user : null;
  });

  const history = useHistory();

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // verify user details
  useEffect(() => {
    const handleVerifyUser = async () => {
      let googleParams = {
        uid: currentUser?.uid, // google id
        email: currentUser?.email,
      };

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

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export { CurrentUserContext, CurrentUserProvider };
