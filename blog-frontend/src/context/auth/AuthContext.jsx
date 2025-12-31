import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
});

export default AuthContext;
