import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiBookmark, 
  FiTrendingUp, 
  FiUser, 
  FiUsers,
  FiCode,
  FiImage,
  FiBriefcase,
  FiHeart,
  FiCamera,
  FiMusic,
  FiZap,
  FiEdit3,
  FiGlobe
} from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'

const SideBar = ({ onNavigate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const handleNavigate = (path) => {
    navigate(path)
    if (onNavigate) onNavigate()
  }

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`)
    if (onNavigate) onNavigate()
  }

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
    { icon: FiBookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: FiUsers, label: 'Following', path: '/following' },
  ]

  const categories = [
    { name: 'Technology', icon: FiZap, slug: 'technology' },
    { name: 'Programming', icon: FiCode, slug: 'programming' },
    { name: 'Web Development', icon: FiGlobe, slug: 'web-development' },
    { name: 'Design', icon: FiImage, slug: 'design' },
    { name: 'Business', icon: FiBriefcase, slug: 'business' },
    { name: 'Lifestyle', icon: FiHeart, slug: 'lifestyle' },
    { name: 'Photography', icon: FiCamera, slug: 'photography' },
    { name: 'Music', icon: FiMusic, slug: 'music' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Menu */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition ${
                active
                  ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-800 mx-4"></div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">
          Topics
        </h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.slug}
                onClick={() => handleCategoryClick(category.slug)}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User Section - Only on mobile */}
      {user && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-800 mx-4"></div>
          <div className="p-4 space-y-2 lg:hidden">
            <button
              onClick={() => handleNavigate('/write')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FiEdit3 className="w-5 h-5" />
              <span className="font-medium">Write</span>
            </button>
            <button
              onClick={() => handleNavigate('/profile')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FiUser className="w-5 h-5" />
              <span className="font-medium">Your Profile</span>
            </button>
          </div>
        </>
      )}

      {/* Sign in buttons - Only on mobile when not logged in */}
      {!user && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-800 mx-4"></div>
          <div className="p-4 space-y-2 lg:hidden">
            <button
              onClick={() => handleNavigate('/login')}
              className="w-full px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition text-sm"
            >
              Sign in
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              className="w-full px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition text-sm font-medium"
            >
              Get started
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SideBar