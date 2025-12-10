import ReviewModel from "../models/reviewModel.js";
import SpotModel from "../models/spotsModel.js"; // Pastikan path ini benar

export const createReview = async (req, res) => {
    try {
        const data = req.body;
        const { spot_id } = data;

        // 1. Buat Review Baru
        await ReviewModel.create(data);

        // 2. Update Rating di Spot (Asumsi fungsi ini ada di SpotModel dan sudah async)
        // Kita gunakan try-catch terpisah atau satu flow, di sini saya gabung
        if (SpotModel.updateRating) {
             await SpotModel.updateRating(spot_id);
        } else {
            console.warn("⚠️ Warning: SpotModel.updateRating function not found");
        }

        res.json({ message: "Review added & rating updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server Error saat membuat review", error });
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