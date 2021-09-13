import React, { useState, createContext, useContext } from 'react';

const AlertsContext = createContext();
const useAlerts = () => useContext(AlertsContext);

function AlertsProvider({ children }) {
  // alert : {type: 'error', message: 'error xxx'}
  const [currentAlert, setCurrentAlert] = useState(null);

  const pushAlert = ({ message, type }) => setCurrentAlert({ type, message });
  const closeAlert = () => setCurrentAlert(null);

  const value = {
    currentAlert,
    setCurrentAlert,
    pushAlert,
    closeAlert,
  };

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export { AlertsContext, AlertsProvider, useAlerts };
