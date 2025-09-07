import express from "express";
import { getUserDashboard, getAdminDashboard } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getAllUsers, deleteUser, updateUser } from "../controllers/dashboardController.js";


const router = express.Router();

router.get("/user", authMiddleware, roleMiddleware(["user"]), getUserDashboard);
router.get("/admin", authMiddleware, roleMiddleware(["admin"]), getAdminDashboard);


// Admin-only: Get list of users
router.get( "/admin/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.put("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);
router.delete("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

export default router;
