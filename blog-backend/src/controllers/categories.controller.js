import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import BlogCategoryController from "../models/blog.categories.model.js";

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

export { createCategory, getAllCategories };