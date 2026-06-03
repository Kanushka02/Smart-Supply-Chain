import {
  useState
} from 'react';

import AuthContext
from './AuthStore';

export function AuthProvider({
  children
}) {

  const [user] = useState({
    id: 1,
    name: 'Kanushka',
    role: 'ADMIN'
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
