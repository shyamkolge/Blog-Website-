import React, { useEffect, useState, useRef } from 'react'
import { getAllBlogsAPI, checkUserLikedAPI, toggleLikeAPI } from '../api/blog.api'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiTag } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import BlogCard from '../components/BlogCard'

const HomePage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likedBlogs, setLikedBlogs] = useState(new Set())
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const hasShownGoogleAuthToast = useRef(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  // Handle Google OAuth redirect - only show toast once
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth')
    if (googleAuth === 'success' && !hasShownGoogleAuthToast.current) {
      hasShownGoogleAuthToast.current = true
      toast.success('Successfully signed in with Google!')
      // Remove query parameter from URL
      navigate('/', { replace: true })
    }
  }, [searchParams, toast, navigate])

  useEffect(() => {
    if (user && blogs.length > 0) {
      checkLikedStatuses()
    }
  }, [user, blogs])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await getAllBlogsAPI()
      if (response.success && response.data && response.data.length > 0) {
        setBlogs(response.data)
      } 
    } catch (err) {
      // On error, use sample data
      setError('Failed to load blogs. Please try again later.')
      console.error('Error fetching blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLikedStatuses = async () => {
    if (!user) return
    
    const likedSet = new Set()
    
    // Check like status for each blog
    const promises = blogs.map(async (blog) => {
      try {
        const response = await checkUserLikedAPI(blog._id)
        if (response.success && response.data.liked) {
          likedSet.add(blog._id)
        }
      } catch (err) {
        // Silently fail - user might not be logged in or blog might not exist
        console.error(`Error checking like status for blog ${blog._id}:`, err)
      }
    })
    
    await Promise.all(promises)
    setLikedBlogs(likedSet)
  }

  const handleLikeClick = async (blogId) => {
    if (!user) {
      toast.warning('Please log in to like blogs')
      navigate('/login')
      return
    }

    try {
      const response = await toggleLikeAPI(blogId)
      if (response.success) {
        // Update liked blogs set
        setLikedBlogs(prev => {
          const newSet = new Set(prev)
          if (response.data.liked) {
            newSet.add(blogId)
          } else {
            newSet.delete(blogId)
          }
          return newSet
        })
        // Update blog like count in the blogs array
        setBlogs(prev => prev.map(blog => 
          blog._id === blogId 
            ? { ...blog, likeCount: response.data.likeCount }
            : blog
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      toast.error(err.response?.data?.message || 'Failed to like blog')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="mb-12 text-center py-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold dark:text-white text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
          Discover stories, thinking, and expertise
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore articles from writers on any topic
        </p>
      </div>

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FiTag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No blogs found</p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Be the first to write a blog!</p>
            {user && (
              <button
                onClick={() => navigate('/write')}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
              >
                Write Your First Blog
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              isLiked={likedBlogs.has(blog._id)}
              onLikeClick={handleLikeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage