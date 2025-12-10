import BlogModel from "../models/blogsModel.js";

export const getAllPosts = async (req, res) => {
    try {
        const posts = await BlogModel.getAll();
        res.json(posts);
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ message: "Gagal ambil data blog" });
    }
};

export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await BlogModel.getBySlug(slug);

        if (!post) {
            return res.status(404).json({ message: "Post tidak ditemukan" });
        }

        res.json(post);
    } catch (error) {
        console.error("Error getting post detail:", error);
        res.status(500).json({ message: "Gagal ambil detail post" });
    }
};

export const createPost = async (req, res) => {
    try {
        const data = req.body;

        // Validasi sederhana
        if (!data.title || !data.slug || !data.content) {
            return res.status(400).json({ message: "Title, slug, dan content wajib diisi" });
        }

        const result = await BlogModel.create(data);
        
        res.json({ 
            message: "Post berhasil ditambah", 
            id: result.insertId 
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Gagal menambah post", error });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const result = await BlogModel.update(data, id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Post tidak ditemukan" });
        }

        res.json({ message: "Post berhasil diedit" });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Gagal update post", error });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BlogModel.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Post tidak ditemukan" });
        }

        res.json({ message: "Post berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Gagal hapus post", error });
    }
};