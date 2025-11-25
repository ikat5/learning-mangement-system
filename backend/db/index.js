import mongoose from "mongoose";
const DB_name = "lms"
const connectDb = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_name}`
    );
    if (connection) {
      console.log("Database connected successfully");
    }
  } catch (err) {
    console.log("Error while connecting to database", err);
  }
};

export default connectDb;
