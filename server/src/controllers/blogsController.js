import BlogModel from "../models/blogsModel.js";

/*
    Controller: Mengambil semua blog post.
    - Mengakses layer model untuk fetch data.
    - Hanya return JSON tanpa transformasi tambahan.
*/
export const getAllPosts = async (req, res) => {
    try {
        const posts = await BlogModel.getAll();
        res.json(posts);
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ message: "Gagal ambil data blog" });
    }
};

/*
    Controller: Mengambil detail post berdasarkan slug.
    - Slug dipakai karena lebih SEO-friendly dibanding id.
    - Jika tidak ditemukan, balikin 404 biar client ngerti.
*/
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

/*
    Controller: Membuat post baru.
    - Wajib ada title, slug, dan content.
    - Data langsung dilempar ke model.
    - Response mengembalikan insertId untuk keperluan client.
*/
export const createPost = async (req, res) => {
    try {
        const data = req.body;

        // Validasi dasar biar request kosong tidak lewat
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

/*
    Controller: Mengupdate post berdasarkan id.
    - Mengambil id dari params.
    - Jika affectedRows 0 berarti id tidak ada.
*/
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

/*
    Controller: Menghapus post.
    - Berdasarkan id.
    - Jika tidak ada, balikin 404 sebagai indikasi.
*/
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
