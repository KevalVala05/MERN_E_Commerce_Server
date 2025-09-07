import express from "express";
import { getProfile, updateProfile, getUserOrders } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/orders", getUserOrders);

export default router;
