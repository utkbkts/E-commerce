import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    if (connection) {
      console.log("db connected is success");
    }
  } catch (error) {
    console.log("🚀 ~ connectDB ~ error:", error);
    process.exit(1);
  }
};
