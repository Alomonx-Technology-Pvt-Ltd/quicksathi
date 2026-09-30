import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20,                 // Maintain up to 20 socket connections for high concurrency
      minPoolSize: 5,                  // Keep 5 warm connections open to eliminate cold latency
      serverSelectionTimeoutMS: 5000,  // Fail fast if server is unreachable
      socketTimeoutMS: 45000,          // 45s before timing out queries
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
