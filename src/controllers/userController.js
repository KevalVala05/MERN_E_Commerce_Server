import User from "../models/User.js";
import Order from "../models/Order.js";
import bcrypt from "bcrypt";


export const getProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};


export const updateProfile = async (req, res) => {
  const { name, email, address, password } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
