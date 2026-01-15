import AuthContext from "./AuthContext";
import { useEffect, useState, useCallback } from "react";
import {loginAPI , logoutAPI, signupAPI, getMeApi } from '../../api/auth.api'
import AppLoader from "../../pages/AppLoader";

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle forced logout (e.g., refresh token expired)
  const handleForcedLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // Listen for auth:logout event from axios interceptor
  useEffect(() => {
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => {
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, [handleForcedLogout]);

  // Persistent Login
  useEffect(()=>{
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getMeApi();
        setUser(data.data);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  },[])


  // 📝 Login function
  const login = async (credentials)=>{
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await loginAPI(credentials);
      setUser(data.data);
      return data;
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  // 📝 Signup function
  const register = async (credentials)=>{
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await signupAPI(credentials);
      setUser(data.data);
      return data;
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  }


  // 🚪 Logout function
  const logout = async ()=>{
    await logoutAPI();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
    {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
