import React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBlogsByCategoryAPI } from "../api/blog.api";
import { useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import BlogCard from "../components/BlogCard";


const CategoryWiseBlogs = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchBlogsByCategory = async (slug) => {
    try {
      setLoading(true);
      const data = await getBlogsByCategoryAPI(slug);
      if (data.success) {
        setBlogs(data.data || []);
      } else {
        setBlogs([]);
        toast.error(data.message || "Failed to fetch blogs for this category");
      }
    } catch (error) {
      setBlogs([]);
      console.log("Error fetching categories : ", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch blogs for this category"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogsByCategory(slug);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Blogs List */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No blogs found in this category.
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            Start exploring other categories or create a new blog!
          </p>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} isLiked={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryWiseBlogs;
