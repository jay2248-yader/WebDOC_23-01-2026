import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextValue';

/**
 * Custom hook to access authentication context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;
