const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../controllers/adminController");
const { isAdminLoggedIn } = require("../middlewares/isAdminLoggedIn");
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");
const upload = require("../utils/multer-config");
const {
  createCarousel,
  updateCarousel,
  getCarousel,
  getAdminCarousel,
  deleteCarousel,
} = require("../controllers/carouselController");
const router = express.Router();

//routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/logout", isAdminLoggedIn, logoutAdmin);

module.exports = router;
