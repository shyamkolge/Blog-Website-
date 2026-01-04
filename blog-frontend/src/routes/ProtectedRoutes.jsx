import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { FiLock, FiArrowLeft, FiLogIn, FiHome } from 'react-icons/fi'

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected route
  if (user) {
    return <Outlet />;
  }

  // Access denied UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-black dark:text-white cursor-pointer mb-2"
            onClick={() => navigate("/")}
          >
            Topicology
          </h1>
        </div>

        {/* Access Denied Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiLock className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Access Denied
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            You need to be logged in to access this page. Please sign in to continue.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FiLogIn className="w-5 h-5" />
              <span>Sign In</span>
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/register")}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center space-x-2"
              >
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition py-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoutes