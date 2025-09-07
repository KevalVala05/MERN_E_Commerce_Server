import express from "express";
import {
  createOrder,
  cancelOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// USER routes
router.post("/", authMiddleware, roleMiddleware(["user"]), createOrder);
router.put("/:id/cancel", authMiddleware, roleMiddleware(["user"]), cancelOrder);
router.get("/:id", authMiddleware, roleMiddleware(["user"]), getOrderById);

// ADMIN routes
router.get("/admin/orders", authMiddleware, roleMiddleware(["admin"]), getAllOrders);
router.put("/admin/orders/:id/status", authMiddleware, roleMiddleware(["admin"]), updateOrderStatus);

export default router;
