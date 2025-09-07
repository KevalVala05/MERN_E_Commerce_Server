import mongoose from "mongoose";

const connectDB = async (MONGO_URI) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
};

export default connectDB;
