import {Router} from "express"
import {createBlog, getAllBlogs, getUserBlogs , updateBlog, deleteBlog, createCategory} from "../controllers/blog.controller.js"
import auth from "../middlewares/auth.middleware.js";


const router = Router();


router.post("/create", auth, createBlog);
router.get("/", getAllBlogs);
router.get("/user-blogs", auth, getUserBlogs);
router.patch("/:blogId", auth, updateBlog);
router.delete("/:blogId", auth, deleteBlog);


router.post("/category", auth, createCategory);



export default router;