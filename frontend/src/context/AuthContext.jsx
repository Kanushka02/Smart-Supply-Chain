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
    role: 'SUPPLIER'
    // ADMIN
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