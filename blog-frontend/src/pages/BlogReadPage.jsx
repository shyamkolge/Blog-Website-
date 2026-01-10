import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBlogBySlugAPI,
  toggleLikeAPI,
  checkUserLikedAPI,
  addCommentAPI,
  getBlogCommentsAPI,
  deleteCommentAPI,
  bookMarkAPI,
} from "../api/blog.api";
import {
  followUserAPI,
  unfollowUserAPI,
  checkUserFollowAPI,
} from "../api/connection.api";

import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import {
  FiClock,
  FiUser,
  FiHeart,
  FiMessageCircle,
  FiArrowLeft,
  FiSend,
  FiTrash2,
  FiLoader,
  FiBookmark,
  FiShare2,
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
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnBlog = user && blog?.author?._id === user?._id;


  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (!blog) return;
    fetchComments();
  }, [blog]);

  useEffect(() => {
    if (!blog || !user) return;
    checkLikeStatus();
    checkBookmarkStatus();
    checkFollowingStatus();

    // Scroll to comments section if hash is present
    if (window.location.hash === "#comments") {
      setTimeout(() => {
        const commentsSection = document.getElementById("comments-section");
        if (commentsSection) {
          commentsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);
    }
  }, [blog, user]);

  // Fetching the blog data
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

  // Check if the user has liked the blog
  const checkLikeStatus = async () => {
    if (!blog) return;
    try {
      const response = await checkUserLikedAPI(blog._id);
      if (response.success) {
        setIsLiked(response.data.liked || false);
      }
    } catch (err) {
      setIsLiked(false);
    }
  };

  // Check if the user has bookmarked the blog
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

  const checkFollowingStatus = async () => {
    if (!blog || !user) {
      setIsFollowing(false);
      return;
    }
    const isFollow = await checkUserFollowAPI(blog.author._id);
    if (isFollow.success) {
      setIsFollowing(isFollow.data.isFollowing);
    } else {
      setIsFollowing(false);
    }
  };

  // Handle like button click
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
        setIsLiked(response.data.liked);
        setBlog((prev) => ({
          ...prev,
          likeCount: response.data.likeCount,
        }));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to like blog");
    } finally {
      setLiking(false);
    }
  };

  // Handle bookmark button click
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
        const bookmarked =
          response.data?.bookmarked ??
          response.data?.isBookmarked ??
          !isBookmarked;
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

  // Fetch comments for the blog
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

  // Handle adding a new comment
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
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        setBlog((prev) => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1,
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

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await deleteCommentAPI(commentId);
      if (response.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
        setBlog((prev) => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1),
        }));
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  //  Handle share button click
  const handleShare = async () => {
    if (!blog) return;

    const blogUrl = `${window.location.origin}/blog/${blog.slug}`;
    const shareData = {
      title: blog.tittle,
      text: blog.tittle,
      url: blogUrl,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          prompt("Copy this link:", blogUrl);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          console.error("Error sharing:", clipboardErr);
          toast.error("Failed to share blog");
        }
      }
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Estimate reading time based on word count
  const getReadingTime = (content) => {
    if (!content) return "1 min read";
    // Strip HTML tags for accurate word count
    const stripHtmlTags = (html) => {
      if (!html) return "";
      if (typeof document === "undefined") {
        return html
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();
      }
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").trim();
    };
    const plainText = stripHtmlTags(content);
    const wordsPerMinute = 200;
    const wordCount = plainText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  // Handle the follow to the author
  const handleFollow = async () => {
    if (!user) {
      toast.warning("Please log in to follow authors");
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUserAPI(blog.author._id);
        setIsFollowing(false);
      } else {
        await followUserAPI(blog.author._id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "Blog not found"}
          </p>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with back button */}
      <div className="border-b border-gray-200 dark:border-gray-800 top-16 z-10 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content - Medium Style */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Author Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            {blog.author?.profilePhoto ? (
              <img
                src={blog.author.profilePhoto}
                alt={blog.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {blog.author?.firstName} {blog.author?.lastName}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span>·</span>
                  <span>{getReadingTime(blog.content)}</span>
                </div>
              </div>
              {/* Follow button  */}
              {
                !isOwnBlog &&(
                <button
                onClick={() => handleFollow()}
                className="px-3 py-1.5 text-sm sm:px-3.5 sm:py-2 lg:px-4 lg:py-1.5 lg:text-base bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight">
          {blog.tittle}
        </h1>

        {/* Feature Image */}
        {blog.featureImages && (
          <div className="mb-8 sm:mb-12 -mx-4 sm:mx-0">
            <img
              src={blog.featureImages}
              alt={blog.tittle}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div
            className="blog-content text-gray-800 dark:text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Engagement Footer - Medium Style */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                disabled={liking || !user}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                } ${
                  !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {liking ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <FiHeart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                )}
                <span className="text-sm font-medium">
                  {blog.likeCount || 0}
                </span>
              </button>
              <button
                onClick={() => {
                  const commentsSection =
                    document.getElementById("comments-section");
                  if (commentsSection) {
                    commentsSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {blog.commentCount || 0}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiShare2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
              {user && (
                <button
                  onClick={handleBookmark}
                  disabled={bookmarking}
                  className={`flex items-center space-x-2 transition-colors ${
                    isBookmarked
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                  } ${
                    !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {bookmarking ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiBookmark
                      className={`w-5 h-5 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Author Card */}
        {/* <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-12">
          <div className="flex items-center space-x-4">
            {blog.author?.profilePhoto ? (
              <img
                src={blog.author.profilePhoto}
                alt={blog.author.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <FiUser className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <div>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {blog.author?.firstName} {blog.author?.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{blog.author?.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {blog.author?.email}
              </p>
            </div>
          </div>
        </div> */}
      </article>

      {/* Comments Section */}
      <div
        id="comments-section"
        className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Responses ({blog.commentCount || 0})
            </h2>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-12">
              <div className="flex items-start space-x-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none"
                    disabled={submittingComment}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Press Enter to submit, Shift+Enter for new line
                    </p>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                    >
                      {submittingComment ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          <span>Respond</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-12 p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Sign in to leave a response
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
              >
                Sign in
              </button>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No responses yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start space-x-4 pb-8 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                >
                  {comment.user?.profilePhoto ? (
                    <img
                      src={comment.user.profilePhoto}
                      alt={comment.user.username}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {user && comment.user?._id === user._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1"
                          title="Delete comment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogReadPage;
