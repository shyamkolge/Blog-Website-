import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import CategoryModel from "../models/blog.categories.model.js";
import blogModel from "../models/blog.model.js";

// Category Controller
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
  
    const category = await CategoryModel.create({
      name,
      slug,
    });
  
    return res.json(new ApiResponse(201, category, "Category created successfully"));
  });

  // Get all categories
  const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryModel.find().sort({ name: 1 });
    return res.json(new ApiResponse(200, categories, "Categories fetched successfully"));
  });


  // Get the blogs by category 
  const getBlogsByCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
  
    const category = await CategoryModel.findOne({ slug });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  
    const blogs = await blogModel.find({ category: category._id })
      .populate('author', 'firstName lastName username profilePhoto email')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    
    return res.json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
  });

export { createCategory, getAllCategories, getBlogsByCategory };