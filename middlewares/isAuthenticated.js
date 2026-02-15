const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    console.log("Cookies received:", req.cookies);

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

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
