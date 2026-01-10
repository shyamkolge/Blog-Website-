import {Router} from "express"
import {
  createBlog, 
  getAllBlogs, 
  getUserBlogs, 
  updateBlog, 
  deleteBlog,
  getBlogBySlug,
  getUserLikedPosts,
  getUserComments,
  toggleLike,
  checkUserLiked,
  addComment,
  getBlogComments,
  deleteComment,
  bookmarkBlog,
  getBookmarkedBlogs
} from "../controllers/blog.controller.js"
import isLoggedIn from "../middlewares/auth.middleware.js";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// Category Controller import
import { createCategory, getAllCategories, getBlogsByCategory } from "../controllers/categories.controller.js";


const router = Router();

// Access control routes
router.get("/", getAllBlogs);
router.get("/categories", getAllCategories);
router.get("/categories/:slug", getBlogsByCategory);
router.get("/slug/:slug", getBlogBySlug);
router.get("/user-blogs", isLoggedIn, getUserBlogs);
router.get("/liked-posts", isLoggedIn, getUserLikedPosts);
router.get("/comments", isLoggedIn, getUserComments);

// Like routes
router.post("/:blogId/like", isLoggedIn, toggleLike);
router.get("/:blogId/like-status", optionalAuth, checkUserLiked);

// Comment routes
router.post("/:blogId/comments", isLoggedIn, addComment);
router.get("/:blogId/comments", getBlogComments);
router.delete("/comments/:commentId", isLoggedIn, deleteComment);

// Blog create, update, delete routes
router.post("/create", isLoggedIn, upload.single("featureImages"), createBlog);
router.patch("/:blogId", isLoggedIn, updateBlog);
router.delete("/:blogId", isLoggedIn, deleteBlog);


// Category create route
router.post("/category", isLoggedIn, createCategory);


// book mark the blog 
router.post("/:blogId/bookmark", isLoggedIn, bookmarkBlog);
router.get("/bookMarked", isLoggedIn , getBookmarkedBlogs);

export default router;