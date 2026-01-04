import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getBlogBySlugAPI, 
  toggleLikeAPI, 
  checkUserLikedAPI,
  addCommentAPI,
  getBlogCommentsAPI,
  deleteCommentAPI,
  bookMarkAPI
} from "../api/blog.api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import {
  FiClock,
  FiUser,
  FiHeart,
  FiMessageCircle,
  FiEye,
  FiShare2,
  FiArrowLeft,
  FiTag,
  FiSend,
  FiTrash2,
  FiLoader,
  FiBookmark,
} from "react-icons/fi";

const BlogReadPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog && user) {
      checkLikeStatus();
    }
    if (blog) {
      fetchComments();
    }
    
    // Scroll to comments section if hash is present
    if (window.location.hash === '#comments') {
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [blog, user]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogBySlugAPI(slug);
      if (response.success) {
        setBlog(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Blog not found");
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    if (!blog) return;
    try {
      const response = await checkUserLikedAPI(blog._id);
      if (response.success) {
        setIsLiked(response.data.liked || false);
      }
    } catch (err) {
      // If user is not logged in, that's fine - just set liked to false
      setIsLiked(false);
    }
  };

  const checkBookmarkStatus = () => {
    if (!blog || !user || !user.bookmarkedBlogs) {
      setIsBookmarked(false);
      return;
    }
    const bookmarked = user.bookmarkedBlogs.some(
      (id) => id.toString() === blog._id.toString()
    );
    setIsBookmarked(bookmarked);
  };

  const handleLike = async () => {
    if (!user) {
      toast.warning("Please log in to like blogs");
      navigate("/login");
      return;
    }

    setLiking(true);
    try {
      const response = await toggleLikeAPI(blog._id);
      if (response.success) {
        setIsLiked(response.data.isLiked);
        setBlog(prev => ({
          ...prev,
          likeCount: response.data.likeCount
        }));
        toast.success(response.data.isLiked ? "Blog liked!" : "Blog unliked");
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to like blog");
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.warning("Please log in to bookmark blogs");
      navigate("/login");
      return;
    }

    setBookmarking(true);
    try {
      const response = await bookMarkAPI(blog._id);
      if (response.success || response.status === "success") {
        const bookmarked = response.data?.bookmarked ?? response.data?.isBookmarked ?? !isBookmarked;
        setIsBookmarked(bookmarked);
        toast.success(bookmarked ? "Blog bookmarked!" : "Blog unbookmarked");
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      toast.error(err.response?.data?.message || "Failed to bookmark blog");
    } finally {
      setBookmarking(false);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;
    setLoadingComments(true);
    try {
      const response = await getBlogCommentsAPI(blog._id);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Please log in to comment");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      toast.warning("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await addCommentAPI(blog._id, newComment);
      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setNewComment("");
        setBlog(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
        toast.success("Comment added successfully!");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await deleteCommentAPI(commentId);
      if (response.success) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        setBlog(prev => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleShare = async () => {
    if (!blog) return;
    
    const blogUrl = `${window.location.origin}/blog/${blog.slug}`;
    const shareData = {
      title: blog.tittle,
      text: truncateContent(blog.content, 100),
      url: blogUrl,
    };

    try {
      // Check if Web Share API is supported (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          // Final fallback: Show URL in prompt
          prompt("Copy this link:", blogUrl);
        }
      }
    } catch (err) {
      // User cancelled share (AbortError) - do nothing
      if (err.name !== 'AbortError') {
        // Other error - try clipboard fallback
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          console.error("Error sharing:", clipboardErr);
          toast.error("Failed to share blog");
          prompt("Copy this link:", blogUrl);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatReadingTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 flex items-center justify-center min-h-[68vh] ">
        <div className="text-center h-screen w-screen">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-white dark:bg-gray-900 flex items-center justify-center min-h-[68vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Blog not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 mb-4 sm:mb-6 group"
        >
          <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm sm:text-base">Back</span>
        </button>

        {/* Article Header */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Feature Image */}
          {blog.featureImages && (
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] overflow-hidden relative">
              <img
                src={blog.featureImages}
                alt={blog.tittle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            {/* Category */}
            {blog.category && (
              <div className="mb-4 sm:mb-5 md:mb-6">
                <span className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <FiTag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{blog.category.name}</span>
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8 leading-tight sm:leading-tight md:leading-tight">
              {blog.tittle}
            </h1>

            {/* Author Info & Meta */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10 pb-6 sm:pb-8 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer">
                  {blog.author?.profilePhoto ? (
                    <div className="relative">
                      <img
                        src={blog.author.profilePhoto}
                        alt={blog.author.username}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 dark:group-hover:ring-blue-500 transition-all duration-200"
                      />
                      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 dark:group-hover:ring-blue-500 transition-all duration-200">
                      <FiUser className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-base sm:text-lg md:text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {blog.author?.firstName} {blog.author?.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">@{blog.author?.username}</p>
                  </div>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  disabled={bookmarking || !user}
                  className={`p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
                    isBookmarked 
                      ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={user ? (isBookmarked ? "Remove bookmark" : "Bookmark") : "Login to bookmark"}
                >
                  {bookmarking ? (
                    <FiLoader className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <FiBookmark className={`w-5 h-5 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''} transition-transform hover:scale-110`} />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                <span className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{formatDate(blog.createdAt)}</span>
                </span>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 font-medium">
                  {formatReadingTime(blog.content)}
                </span>
              </div>
            </div>

            {/* Blog Content */}
            <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl max-w-none">
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed blog-content"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
                  lineHeight: "1.8",
                  fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Engagement Stats */}
            <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center flex-wrap gap-3 sm:gap-4 md:gap-6">
                  <button 
                    onClick={handleLike}
                    disabled={liking || !user}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                      isLiked 
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
                  >
                    {liking ? (
                      <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''} transition-transform hover:scale-110`} />
                    )}
                    <span className="font-semibold text-sm sm:text-base">{blog.likeCount || 0}</span>
                  </button>
                  <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                    <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">{blog.commentCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                    <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">{blog.readCount || 0}</span>
                  </div>
                </div>
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium text-sm sm:text-base"
                >
                  <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        
        {/* Comments Section */}
        <div id="comments-section" className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 sm:space-x-3">
              <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
              <span>Comments</span>
            </h2>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold text-xs sm:text-sm">
              {blog.commentCount || 0}
            </span>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-start space-x-3 sm:space-x-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.username}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
                    <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 resize-none text-sm sm:text-base"
                    disabled={submittingComment}
                  />
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Press Enter to submit, Shift+Enter for new line
                    </p>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
                    >
                      {submittingComment ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          <span className="hidden sm:inline">Post Comment</span>
                          <span className="sm:hidden">Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 sm:mb-8 md:mb-10 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium text-sm sm:text-base">Please log in to leave a comment</p>
              <button
                onClick={() => navigate("/login")}
                className="px-5 sm:px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Sign in
              </button>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FiMessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">No comments yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start space-x-4 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-400 dark:hover:border-blue-500"
                >
                  {comment.user?.profilePhoto ? (
                    <img
                      src={comment.user.profilePhoto}
                      alt={comment.user.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
                      <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {user && comment.user?._id === user._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 p-2 rounded-lg shrink-0"
                          title="Delete comment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Posts Section (Optional - can be added later) */}
      {/* <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">More from {blog.category?.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">Related posts coming soon...</p>
      </div> */}
    </div>
  );
};

export default BlogReadPage;

