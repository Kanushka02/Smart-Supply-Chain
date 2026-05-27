import {
  createContext,
  useContext,
  useState
} from 'react';

const AuthContext =
  createContext();

export function AuthProvider({
  children
}) {

  const [user] = useState({
    name: 'Kanushka',
    role: 'ADMIN'
    // SUPPLIER
  });

  return (
    <AuthContext.Provider
      value={{ user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}