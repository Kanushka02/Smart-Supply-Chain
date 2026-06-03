import {
  useContext
} from 'react';

import AuthContext
from './AuthStore';

export function useAuth() {
  return useContext(AuthContext);
}
