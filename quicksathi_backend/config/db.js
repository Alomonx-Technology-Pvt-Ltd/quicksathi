import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These settings improve reliability on cloud deployments (Render, etc.)
      serverSelectionTimeoutMS: 10000, // 10s to find server
      socketTimeoutMS: 45000,          // 45s before timing out queries
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
