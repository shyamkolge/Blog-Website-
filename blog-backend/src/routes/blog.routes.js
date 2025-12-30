import {Router} from "express"
import {createBlog, getAllBlogs, getUserBlogs , updateBlog, deleteBlog} from "../controllers/blog.controller.js"


const router = Router();


router.post("/create", createBlog);
router.get("/", getAllBlogs);
router.get("/user-blogs", getUserBlogs);
router.patch("/:blogId", updateBlog);
router.delete("/:blogId", deleteBlog);


export default router;