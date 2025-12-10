import SessionModel from "../models/sessionsModel.js";

export const getSessionsBySpot = async (req, res) => {
    try {
        const spotId = req.params.spotId;
        const date = req.query.date; 

        const sessions = await SessionModel.getAllBySpot(spotId, date);

        res.json(sessions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error saat mengambil sesi" });
    }
};


export const getNextSession = async (req, res) => {
    try {
        const spotId = req.params.spotId;

        const session = await SessionModel.getNextSession(spotId);

        if (!session) {
            return res.status(404).json({ message: "Tidak ada sesi tersedia hari ini" });
        }

        res.json(session);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error saat mengambil next session" });
    }
};

export const getOperationalHours = async (req, res) => {
    try {
        const spotId = req.params.spotId;
    
        const sessions = await SessionModel.getAllBySpot(spotId);

        if (!sessions || sessions.length === 0) {
            return res.json({ open: null, close: null });
        }

        // Logic pencarian jam buka/tutup tetap sama
        const earliest = sessions.reduce((min, s) => 
            s.start_time < min.start_time ? s : min
        );

        const latest = sessions.reduce((max, s) => 
            s.end_time > max.end_time ? s : max
        );

        res.json({
            open: earliest.start_time,
            close: latest.end_time
        });

    } catch (err) {
        console.error("ERROR getOperationalHours:", err);
        res.status(500).json({ message: "Error" });
    }
};