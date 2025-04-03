import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables.");
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw new Error("Database connection failed"); // Avoid process.exit(1)
  }
};

export default connectDB;




// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;
// if (!MONGO_URI) {
//   throw new Error("MONGO_URI is not defined in environment variables.");
// }

// const connectDB = async () => {
//   if (mongoose.connection.readyState === 1) {
//     console.log("Already connected to MongoDB.");
//     return;
//   }

//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("MongoDB Connected");
//   } catch (err) {
//     console.error("MongoDB Connection Error:", err);
//     throw new Error("Database connection failed"); // Avoid process.exit(1)
//   }
// };

// export default connectDB;
