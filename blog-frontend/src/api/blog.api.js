import api from "./axios";

/**
 * Get all blogs with sorting and pagination
 * @param {Object} options - Query options
 * @param {string} options.sort - Sorting strategy: 'smart' | 'latest' | 'oldest' | 'popular' | 'random'
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.category - Category slug to filter by
 */
export const getAllBlogsAPI = async (options = {}) => {
  const { sort = 'smart', page = 1, limit = 10, category } = options;
  const params = new URLSearchParams({ sort, page, limit });
  if (category) params.append('category', category);
  
  const response = await api.get(`/v1/blogs?${params}`);
  return response.data;
};

// Get user blogs
export const getUserBlogsAPI = async () => {
  const response = await api.get("/v1/blogs/user-blogs");
  return response.data;
};

// Create blog
export const createBlogAPI = async (data) => {
  const response = await api.post("/v1/blogs/create", data);
  return response.data;
};

// Update blog
export const updateBlogAPI = async (blogId, data) => {
  const response = await api.patch(`/v1/blogs/${blogId}`, data);
  return response.data;
};

// Delete blog
export const deleteBlogAPI = async (blogId) => {
  const response = await api.delete(`/v1/blogs/${blogId}`);
  return response.data;
};

// Get user's liked posts
export const getUserLikedPostsAPI = async () => {
  const response = await api.get("/v1/blogs/liked-posts");
  return response.data;
};

// Get user's comments
export const getUserCommentsAPI = async () => {
  const response = await api.get("/v1/blogs/comments");
  return response.data;
};

// Get all categories
export const getAllCategoriesAPI = async () => {
  const response = await api.get("/v1/blogs/categories");
  return response.data;
};

// Get blog by slug
export const getBlogBySlugAPI = async (slug) => {
  const response = await api.get(`/v1/blogs/slug/${slug}`);
  return response.data;
};

// Like/Unlike blog
export const toggleLikeAPI = async (blogId) => {
  const response = await api.post(`/v1/blogs/${blogId}/like`);
  return response.data;
};

// Check if user liked blog
export const checkUserLikedAPI = async (blogId) => {
  const response = await api.get(`/v1/blogs/${blogId}/like-status`);
  return response.data;
};

// Add comment
export const addCommentAPI = async (blogId, content) => {
  const response = await api.post(`/v1/blogs/${blogId}/comments`, { content });
  return response.data;
};

// Get blog comments
export const getBlogCommentsAPI = async (blogId) => {
  const response = await api.get(`/v1/blogs/${blogId}/comments`);
  return response.data;
};

// Delete comment
export const deleteCommentAPI = async (commentId) => {
  const response = await api.delete(`/v1/blogs/comments/${commentId}`);
  return response.data;
};

// Bookmark a blog 
export const bookMarkAPI = async (blogId) => {
  const response = await api.post(`/v1/blogs/${blogId}/bookmark`);
  return response.data;
};

// Get bookmarked blogs
export const getBookMarkedPostsAPI = async () => {
  const response = await api.get("/v1/blogs/bookMarked");
  return response.data;
};

// Get trending blogs
export const getTrendingBlogsAPI = async (options = {}) => {
  const { page = 1, limit = 10, timeWindow = 7, category } = options;
  const params = new URLSearchParams({ page, limit, timeWindow });
  if (category) params.append('category', category);
  
  const response = await api.get(`/v1/blogs/trending?${params}`);
  return response.data;
};

// Get Followers blogs 
export const getFollowersBlogsAPI = async (options = {}) => {
  const { sort = 'latest' } = options;
  const response = await api.get(`/v1/blogs/followers-blogs?sort=${sort}`);
  return response.data;
}


// Create category
export const getBlogsByCategoryAPI = async (slug) => {
   const response = await api.get(`/v1/blogs/categories/${slug}`);
   return response.data;
}