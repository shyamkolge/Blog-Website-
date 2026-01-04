import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookMarkedPostsAPI } from '../api/blog.api.js';
import { useToast } from '../context/ToastContext.jsx';
import useAuth from '../hooks/useAuth';
import BlogCard from '../components/BlogCard';

const BookMarkedBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBookMarkedPostsAPI();
      if (data.success) {
        setBlogs(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch bookmarked blogs");
      }
    } catch (error) {
      console.error("Error fetching bookmarked blogs:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch bookmarked blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view your bookmarked blogs</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bookmarked blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bookmarked Blogs
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your saved articles and stories
        </p>
      </div>

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No bookmarked blogs yet</p>
          <p className="text-gray-400 dark:text-gray-500">Start bookmarking articles you want to read later!</p>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              isLiked={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookMarkedBlogs;