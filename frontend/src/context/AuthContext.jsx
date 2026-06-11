import {
  useState,
  useEffect
}
from 'react';

import {
  useContext
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
  (accessToken, refreshToken, user) => {

    localStorage.setItem(
      'token',
      accessToken
    );

    localStorage.setItem(
      'refreshToken',
      refreshToken
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

    localStorage.removeItem(
      'refreshToken'
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