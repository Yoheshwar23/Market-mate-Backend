const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }

    const options = {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`Database connected successfully to ${conn.connection.host}`);
  } catch (error) {
    console.log(error, "Database Connection Error");
  }
};

module.exports = connectDB;
