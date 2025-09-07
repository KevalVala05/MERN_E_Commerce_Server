import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// USER: Checkout → Create Order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (let item of cart.products) {
      if (item.productId.isDeleted || item.productId.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${item.productId.name} is not available` });
      }

      orderProducts.push({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      });

      totalAmount += item.productId.price * item.quantity;

      // reduce stock
      item.productId.stock -= item.quantity;
      await item.productId.save();
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // estimated 7 days delivery

    const order = await Order.create({
      userId,
      products: orderProducts,
      totalAmount,
      deliveryDate,
    });

    // clear cart after order
    cart.products = [];
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// USER: Cancel Order (before delivery date)
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, userId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (new Date() > order.deliveryDate) {
      return res.status(400).json({ message: "Cannot cancel after delivery date" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// USER: Get single order
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, userId }).populate("products.productId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").populate("products.productId");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
