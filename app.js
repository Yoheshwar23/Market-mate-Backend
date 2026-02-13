const express = require("express");
const app = express();

const connectDB = require("./databaseConn/dbConn");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv").config();

//custom modules
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");



//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://market-mate-project.netlify.app",
    ],
    credentials: true,
  }),
);
app.options("*", cors());
app.use(cookieParser());
app.use(morgan("dev"));

//routes
app.use("/market-mate/user", userRoutes);
app.use("/market-mate/product", productRoutes);

//server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection error:", err));
