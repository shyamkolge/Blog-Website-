import blogModel from "../models/blog.model.js";
import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import BlogCategoryController from "../models/blog.categories.model.js";
import likeModel from "../models/blog.like.model.js";
import commentModel from "../models/blog.comments.model.js";
import uploadOnCloudinary from "../services/cloudinary.js";

// Create blog
const createBlog = asyncHandler(async (req, res) => {
  const { tittle, content, slug, visibility, category } = req?.body;

  const author = req?.user._id;

  let featureImages = null;

  if (req.file) {
    const uploadRes = await uploadOnCloudinary(req.file.path);
    if (uploadRes?.secure_url) {
      featureImages = uploadRes.secure_url;
    }
  }

  const blog = await blogModel.create({
    tittle,
    content,
    featureImages,
    slug,
    visibility,
    category,
    author,
  });

  // Populate the created blog with author and category
  const populatedBlog = await blogModel.findById(blog._id)
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug');

  res.status(200).json({
    status: "success",
    data: populatedBlog,
    message: "Blog created successfully",
  });

});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.author.toString() !== req?.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this blog");
  }

  await blogModel.findByIdAndDelete(blogId);

  return res.json(new ApiResponce(200, null,"Blog deleted successfully"));
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { tittle, content, slug, visibility, category } = req.body;
  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.author.toString() !== req?.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this blog");
  }

  blog.tittle = tittle || blog.tittle;
  blog.content = content || blog.content;
  blog.slug = slug || blog.slug;
  blog.visibility = visibility || blog.visibility;
  blog.category = category || blog.category;
  blog.updatedAt = Date.now();

  await blog.save();

  return res.json(new ApiResponce(200, blog, "Blog updated successfully"));
});

// Get usr blog
const getUserBlogs = asyncHandler(async (req, res) => {
  const author = req?.user._id;
  const blogs = await blogModel.find({ author })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  return res.json(new ApiResponce(200, blogs, "User Blogs fetched successfully"));
});


// Get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogModel.find({ visibility: 'public' })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  return res.json(new ApiResponce(200, blogs, "Blogs fetched successfully"));
});

// Get single blog by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const blog = await blogModel.findOne({ slug })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug');

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check visibility - only allow public blogs or blogs by the user
  if (blog.visibility === 'private') {
    if (!req.user) {
      throw new ApiError(401, "Please log in to view this private blog");
    }
    if (blog.author._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You don't have permission to view this blog");
    }
  }

  // Increment read count only once per session (using cookie)
  // This prevents counting multiple views from the same user in a short time
  const viewKey = `blog_view_${blog._id}`;
  const hasViewed = req.cookies?.[viewKey];
  
  if (!hasViewed) {
    blog.readCount = (blog.readCount || 0) + 1;
    await blog.save();
    
    // Set a cookie to track this view (expires in 1 hour to allow re-counting after some time)
    res.cookie(viewKey, 'true', {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: false, // Allow client-side access if needed
      sameSite: 'lax'
    });
  }

  return res.json(new ApiResponce(200, blog, "Blog fetched successfully"));
});



// Category Controller
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const category = await BlogCategoryController.create({
    name,
    slug,
  });

  return res.json(new ApiResponce(201, category, "Category created successfully"));
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategoryController.find().sort({ name: 1 });
  return res.json(new ApiResponce(200, categories, "Categories fetched successfully"));
});

// Get user's liked posts
const getUserLikedPosts = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  
  const likes = await likeModel.find({ user: userId })
    .populate({
      path: 'postId',
      populate: [
        { path: 'author', select: 'firstName lastName username profilePhoto email' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .sort({ createdAt: -1 });

  const likedPosts = likes
    .filter(like => like.postId !== null)
    .map(like => like.postId);

  return res.json(new ApiResponce(200, likedPosts, "User liked posts fetched successfully"));
});

// Get user's comments
const getUserComments = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  
  const comments = await commentModel.find({ user: userId })
    .populate({
      path: 'postId',
      populate: [
        { path: 'author', select: 'firstName lastName username profilePhoto email' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .populate('user', 'firstName lastName username profilePhoto')
    .sort({ createdAt: -1 });

  return res.json(new ApiResponce(200, comments, "User comments fetched successfully"));
});

// Like/Unlike a blog
const toggleLike = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to like blogs");
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check if user already liked this blog
  const existingLike = await likeModel.findOne({ postId: blogId, user: userId });

  if (existingLike) {
    // Unlike - remove the like
    await likeModel.findByIdAndDelete(existingLike._id);
    blog.likeCount = Math.max(0, (blog.likeCount || 0) - 1);
    await blog.save();
    
    return res.json(new ApiResponce(200, { liked: false, likeCount: blog.likeCount }, "Blog unliked successfully"));
  } else {
    // Like - add the like
    await likeModel.create({ postId: blogId, user: userId });
    blog.likeCount = (blog.likeCount || 0) + 1;
    await blog.save();
    
    return res.json(new ApiResponce(200, { liked: true, likeCount: blog.likeCount }, "Blog liked successfully"));
  }
});

// Check if user liked a blog
const checkUserLiked = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req?.user?._id;

  if (!userId) {
    return res.json(new ApiResponce(200, { liked: false }, "User not logged in"));
  }

  const like = await likeModel.findOne({ postId: blogId, user: userId });
  return res.json(new ApiResponce(200, { liked: !!like }, "Like status fetched successfully"));
});

// Add a comment to a blog
const addComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to comment");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Create comment
  const comment = await commentModel.create({
    postId: blogId,
    user: userId,
    content: content.trim(),
  });

  // Update blog comment count
  blog.commentCount = (blog.commentCount || 0) + 1;
  await blog.save();

  // Populate comment with user info
  const populatedComment = await commentModel.findById(comment._id)
    .populate('user', 'firstName lastName username profilePhoto');

  return res.json(new ApiResponce(201, populatedComment, "Comment added successfully"));
});

// Get comments for a blog
const getBlogComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const comments = await commentModel.find({ postId: blogId })
    .populate('user', 'firstName lastName username profilePhoto')
    .sort({ createdAt: -1 });

  return res.json(new ApiResponce(200, comments, "Comments fetched successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to delete comments");
  }

  const comment = await commentModel.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user is the author of the comment
  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // Get the blog to update comment count
  const blog = await blogModel.findById(comment.postId);
  if (blog) {
    blog.commentCount = Math.max(0, (blog.commentCount || 0) - 1);
    await blog.save();
  }

  await commentModel.findByIdAndDelete(commentId);

  return res.json(new ApiResponce(200, null, "Comment deleted successfully"));
});


export { 
  createBlog, 
  deleteBlog, 
  updateBlog, 
  getUserBlogs, 
  getAllBlogs,
  getBlogBySlug,
  createCategory,
  getAllCategories,
  getUserLikedPosts,
  getUserComments,
  toggleLike,
  checkUserLiked,
  addComment,
  getBlogComments,
  deleteComment
};
