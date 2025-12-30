import blogModel from "../models/blog.model.js";
import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import BlogCategoryController from "../models/blog.categories.model.js";

// Create blog
const createBlog = asyncHandler(async (req, res) => {
  const { tittle, content, slug, visibility, category } = req?.body;

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

  res.status(200).json({
    status: "success",
    data: blog,
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
  const blogs = await blogModel.find({ author });
  return res.json(new ApiResponce(200, blogs, "User Blogs fetched successfully"));
});


// Get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogModel.find();
  return res.json(new ApiResponce(200, blogs, "Blogs fetched successfully"));
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


export { createBlog, deleteBlog, updateBlog, getUserBlogs, getAllBlogs, createCategory };
