import UserModel from "../models/usersModel.js";

export const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId);

        if(!user) {
            return res.status(404).json({ message: "User tidak ditemukan "});
        }

        res.send(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal mengambil data user "});
    }
}

export const updateUser = async (req, res) => {
    try {
        console.log("Isi Body:", req.body);
        const userId = req.params.id;

        const user = await UserModel.update(userId, req.body);

        res.json({ message: "Profil berhasil diperbarui "});
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal update profil "});
    }
}


