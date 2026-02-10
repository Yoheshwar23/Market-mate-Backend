const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
  searchProducts,
  getProduct,
  addOrUpdateReview,
} = require("../controllers/productController");
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");
const router = express.Router();
const upload = require("../utils/multer-config");

router.post("/register", isUserLoggedIn, upload.single("image"), createProduct);
router.post(
  "/update/:id",
  isUserLoggedIn,
  upload.single("image"),
  updateProduct
);
router.get("/find/:id", getProduct);
router.get("/filter", filterProducts);
router.get("/search", searchProducts);
router.delete("/delete/:id", isUserLoggedIn, deleteProduct);
router.post("/:id/review", isUserLoggedIn, addOrUpdateReview);

module.exports = router;
