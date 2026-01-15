import React, { useState, useEffect, useCallback } from "react";
import { getFollowersBlogsAPI, toggleLikeAPI, checkUserLikedAPI } from "../api/blog.api";
import BlogCard from "../components/BlogCard";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { 
  FiUsers, 
  FiClock, 
  FiArrowUp, 
  FiArrowDown, 
  FiUserPlus,
  FiBookOpen,
  FiRefreshCw
} from "react-icons/fi";

// Sort options
const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First', icon: FiArrowDown },
  { value: 'oldest', label: 'Oldest First', icon: FiArrowUp },
];

const FollowingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState('latest');
  const [followingCount, setFollowingCount] = useState(0);
  const [likedBlogs, setLikedBlogs] = useState(new Set());

  const fetchFollowingBlogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getFollowersBlogsAPI({ sort: sortBy });
      
      if (response.success && response.data) {
        setBlogs(response.data.blogs || []);
        setFollowingCount(response.data.followingCount || 0);
      } else {
        setError("Failed to load blogs. Please try again.");
      }
    } catch (err) {
      setError("Failed to load blogs. Please try again.");
      console.error("Error fetching following blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // Check liked status for blogs
  const checkLikedStatuses = useCallback(async () => {
    if (!user || blogs.length === 0) return;
    
    const likedSet = new Set();
    await Promise.all(
      blogs.map(async (blog) => {
        try {
          const response = await checkUserLikedAPI(blog._id);
          if (response.success && response.data?.liked) {
            likedSet.add(blog._id);
          }
        } catch (err) {
          // Silent fail
        }
      })
    );
    setLikedBlogs(likedSet);
  }, [user, blogs]);

  useEffect(() => {
    if (user) {
      fetchFollowingBlogs();
    }
  }, [user, fetchFollowingBlogs]);

  useEffect(() => {
    checkLikedStatuses();
  }, [checkLikedStatuses]);

  // Handle like toggle
  const handleLikeClick = async (blogId) => {
    if (!user) {
      toast.warning("Please log in to like blogs");
      return;
    }

    try {
      const response = await toggleLikeAPI(blogId);
      if (response.success) {
        setLikedBlogs(prev => {
          const newSet = new Set(prev);
          if (response.data.liked) {
            newSet.add(blogId);
          } else {
            newSet.delete(blogId);
          }
          return newSet;
        });
        
        // Update blog like count
        setBlogs(prev => prev.map(blog => 
          blog._id === blogId 
            ? { ...blog, likeCount: response.data.likeCount }
            : blog
        ));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Failed to update like");
    }
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FiUsers className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            See what your favorite authors are writing
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to follow authors and get their latest blogs in your feed
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your feed...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchFollowingBlogs}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Following
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Stay updated with blogs from authors you follow
        </p>
        
        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <FiUserPlus className="w-4 h-4" />
            {followingCount} {followingCount === 1 ? 'author' : 'authors'}
          </span>
          <span className="flex items-center gap-1">
            <FiBookOpen className="w-4 h-4" />
            {blogs.length} {blogs.length === 1 ? 'blog' : 'blogs'}
          </span>
        </div>
      </div>

      {/* Sort Options */}
      {blogs.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            Sort by:
          </span>
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <FiUsers className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {followingCount === 0 
                ? "You're not following anyone yet" 
                : "No blogs from your followed authors"
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {followingCount === 0 
                ? "Discover and follow authors to see their blogs here"
                : "Authors you follow haven't published any blogs yet"
              }
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
            >
              Discover Authors
            </button>
          </div>
        </div>
      ) : (
        /* Blogs List */
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
  );
};

export default FollowingPage;
