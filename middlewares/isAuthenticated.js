const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv").config();

module.exports.isAuthenticated = async (req, res, next) => {
    console.log('🔍 RAW Cookie Header:', req.headers.cookie);  // Key debug
  console.log('🍪 Parsed Cookies:', req.cookies);
  try {
    console.log("Cookies received:", req.cookies);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = req.cookies?.token;

    if (!token) {
      console.log("No token found");
      return res.status(401).json({
        success: false,
        message: "You must be logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const account = await User.findById(decoded.id).select("-password");

    if (!account) {
      console.log("User not found in DB");
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }

    req.account = account;
    req.role = account.role || (account.isAdmin ? "admin" : "user");

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    console.error("Auth error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
