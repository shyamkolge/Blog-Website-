import blogModel from "../models/blog.model.js";
import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";

// Create blog
const createBlog = asyncHandler(async (req, res) => {
  const { tittle, content, slug, visibility, category } = req.body;

  const author = req?.user._id;

  const featureImages = req.file ? req.file.path : null;

  const blog = await blogModel.create({
    tittle,
    content,
    featureImages,
    slug,
    visibility,
    category,
    author,
  });

  return ApiResponce(res, 201, true, blog, null, "Blog created successfully");
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

  return ApiResponce(res, 200, true, null, null, "Blog deleted successfully");
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

  return ApiResponce(res, 200, true, blog, null, "Blog updated successfully");
});

// Get usr blog
const getUserBlogs = asyncHandler(async (req, res) => {
  const author = req?.user._id;
  const blogs = await blogModel.find({ author });
  return ApiResponce(
    res,
    200,
    true,
    blogs,
    null,
    "User Blogs fetched successfully"
  );
});

// Get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogModel.find();
  return ApiResponce(res, 200, true, blogs, null, "Blogs fetched successfully");
});



export {createBlog, deleteBlog, updateBlog, getUserBlogs, getAllBlogs};