import express from "express"
import { getUser, updateUser } from "../controllers/usersController.js"

const router = express.Router();

router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);


export default router;