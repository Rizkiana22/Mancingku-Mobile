import express from "express";
import { 
    getAllPosts, 
    getPostBySlug, 
    createPost, 
    updatePost, 
    deletePost 
} from "../controllers/blogsController.js";

const router = express.Router();

router.get('/blog', getAllPosts);
router.get('/blog/:slug', getPostBySlug); // Mengambil detail pakai slug (SEO friendly)
router.post('/blog', createPost);
router.patch('/blog/:id', updatePost);
router.delete('/blog/:id', deletePost);

export default router;