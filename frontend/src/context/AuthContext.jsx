import {
  useState,
  useEffect
}
from 'react';

import AuthContext
from './AuthStore';

export const AuthProvider =
({ children }) => {

  const [user,
    setUser] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const token =
    localStorage.getItem(
      'token'
    );

    const savedUser =
    localStorage.getItem(
      'user'
    );

    if (
      token &&
      savedUser
    ) {

      setUser(
        JSON.parse(
          savedUser
        )
      );
    }

    setLoading(false);

  }, []);

  const login =
  (token, user) => {

    localStorage.setItem(
      'token',
      token
    );

    localStorage.setItem(
      'user',

      JSON.stringify(
        user
      )
    );

    setUser(user);
  };

  const logout =
  () => {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};

export const useAuth =
() =>
useContext(
  AuthContext
);