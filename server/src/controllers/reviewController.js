import ReviewModel from "../models/reviewModel.js";
import SpotModel from "../models/spotsModel.js"; // Pastikan path ini benar

export const createReview = async (req, res) => {
    try {
        const { user_id, spot_id, rating, comment } = req.body;

        // 🔴 VALIDASI WAJIB
        if (!user_id || !spot_id) {
            return res.status(400).json({
                message: "User dan Spot wajib diisi"
            });
        }

        if (rating === null || rating === undefined || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating wajib diisi (1–5)"
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                message: "Komentar tidak boleh kosong"
            });
        }

        // 1. Buat Review
        await ReviewModel.create({
            user_id,
            spot_id,
            rating,
            comment
        });

        // 2. Update rating spot
        if (SpotModel.updateRating) {
            await SpotModel.updateRating(spot_id);
        }

        res.status(201).json({
            message: "Review berhasil ditambahkan"
        });

    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);
        res.status(500).json({
            message: "Server error saat membuat review"
        });
    }
};


export const getReviewsBySpot = async (req, res) => {
    try {
        const { spotId } = req.params;
        const reviews = await ReviewModel.getBySpot(spotId);

        res.json(reviews);

    } catch (error) {
        res.status(500).json({ message: "Server Error saat mengambil review" });
    }
};