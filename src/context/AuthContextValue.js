import { createContext } from 'react';

// AuthContext object moved to its own file so Fast Refresh only sees components here.
export const AuthContext = createContext();

export default AuthContext;
