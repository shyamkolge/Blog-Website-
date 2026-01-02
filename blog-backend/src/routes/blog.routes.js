import {Router} from "express"
import {
  createBlog, 
  getAllBlogs, 
  getUserBlogs, 
  updateBlog, 
  deleteBlog,
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
} from "../controllers/blog.controller.js"
import isLoggedIn from "../middlewares/auth.middleware.js";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();


router.post("/create", isLoggedIn, upload.single("featureImages"), createBlog);
router.get("/", getAllBlogs);
router.get("/categories", getAllCategories);
router.get("/slug/:slug", getBlogBySlug);
router.get("/user-blogs", isLoggedIn, getUserBlogs);
router.get("/liked-posts", isLoggedIn, getUserLikedPosts);
router.get("/comments", isLoggedIn, getUserComments);

// Like routes (must come before /:blogId routes)
router.post("/:blogId/like", isLoggedIn, toggleLike);
router.get("/:blogId/like-status", optionalAuth, checkUserLiked);

// Comment routes (must come before /:blogId routes)
router.post("/:blogId/comments", isLoggedIn, addComment);
router.get("/:blogId/comments", getBlogComments);
router.delete("/comments/:commentId", isLoggedIn, deleteComment);

// Blog CRUD routes
router.patch("/:blogId", isLoggedIn, updateBlog);
router.delete("/:blogId", isLoggedIn, deleteBlog);

router.post("/category", isLoggedIn, createCategory);



export default router;