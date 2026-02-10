const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await User.findById(decoded.id).select("-password");

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }

    req.account = account;
    req.role = account.role || (account.isAdmin ? "admin" : "user");

    next();
  } catch (err) {
    console.error("Auth error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
