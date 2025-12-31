import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();

  const { user , logout} = useAuth();

  return (
    <nav className="flex items-center justify-between py-4 px-10 bg-blue-200">
      <div className="text-xl font-bold">Logo</div>
        <div className="flex items-center space-x-4">
          {!user ? (
            <div className="space-x-2 ">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="space-x-4 ">
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Write
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={()=>logout()}>
                Logout
              </button>
            </div>
          )}
        </div>
    
    </nav>
  );
};

export default Header;
