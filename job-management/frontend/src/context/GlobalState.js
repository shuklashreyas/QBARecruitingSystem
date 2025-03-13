import React, { createContext, useState } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });
  const [jobs, setJobs] = useState([]);

  // A function to update jobs globally
  const updateJobs = (newJobs) => {
    setJobs(newJobs);
  };

  return (
    <GlobalContext.Provider
      value={{
        auth,
        setAuth,
        jobs,
        updateJobs,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
