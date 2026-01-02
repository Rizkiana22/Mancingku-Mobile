import HistoryModel from '../models/historyModel.js';

const getHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        const data = await HistoryModel.getByUserId(userId);

        res.json({
            success: true,
            message: 'Data history berhasil diambil',
            data: data
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export default { getHistory };