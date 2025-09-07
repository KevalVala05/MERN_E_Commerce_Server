import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Recent orders (latest 5)
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Total spent
    const totalSpentAgg = await Order.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = totalSpentAgg[0]?.total || 0;

    // Total orders
    const totalOrders = await Order.countDocuments({ userId });

    res.status(200).json({
      profile: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      summary: {
        totalOrders,
        totalSpent,
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAdminDashboard = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ role: "user" });

    // Total products
    const totalProducts = await Product.countDocuments();

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all users (only role "user")
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password"); 
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const { name, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser, code: 200 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", code: 200 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
