const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateCompanyDetails,
  getUser,
  getSellerCompany,
  getSellerProducts,
  addToWishList,
  addToCart,
  getWishlistedProducts,
  removeFromWishlist,
  getCartProducts,
  removeFromCart,
  addUserAddress,
  removeFromAddress,
  getAllAddresses,
  setAddressAsDefault,
  updateUser,
  getAllUsers,
  getAllProducts,
  getOrdersAdmin,
  isAnyOneLoggedIn,
} = require("../controllers/userController");
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");
const router = express.Router();
const upload = require("../utils/multer-config");
const {
  createOrder,
  getOrders,
  cancelOrder,
  markDelivered,
} = require("../controllers/orderController");
const {
  createCarousel,
  getCarousel,
  getAdminCarousel,
  updateCarousel,
  deleteCarousel,
} = require("../controllers/carouselController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

//routes
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", isUserLoggedIn, logoutUser);

router.get("/myaccount", isUserLoggedIn, isAnyOneLoggedIn);

router.get("/account", isUserLoggedIn, getUser);

router.put("/account/update", isUserLoggedIn, updateUser);

router.post(
  "/carousel/create",
  isUserLoggedIn,
  upload.array("image", 5),
  createCarousel,
);
router.get("/carousel", getCarousel);
router.get("/new/carousel", isUserLoggedIn, getAdminCarousel);
router.put(
  "/carousel/update",
  isUserLoggedIn,
  upload.array("image", 5),
  updateCarousel,
);
router.delete("/carousel/delete/:id", isUserLoggedIn, deleteCarousel);

router.post(
  "/seller/company/register",
  isUserLoggedIn,
  upload.single("logo"),
  updateCompanyDetails,
);

router.get("/company/details", isUserLoggedIn, getSellerCompany);
router.get("/seller/products", isUserLoggedIn, getSellerProducts);

router.post("/cart/:id/add", isUserLoggedIn, addToCart);
router.get("/cart/products", isUserLoggedIn, getCartProducts);
router.delete("/cart/products/:id/remove", isUserLoggedIn, removeFromCart);

router.post("/wishlist/:id", isUserLoggedIn, addToWishList);
router.get("/wishlist/products", isUserLoggedIn, getWishlistedProducts);
router.delete(
  "/wishlist/products/:id/remove",
  isUserLoggedIn,
  removeFromWishlist,
);

router.get("/get/addresses", isUserLoggedIn, getAllAddresses);
router.post("/address", isUserLoggedIn, addUserAddress);
router.delete("/address/:id/remove", isUserLoggedIn, removeFromAddress);
router.post("/address/:id/setdefault", isUserLoggedIn, setAddressAsDefault);

router.post("/order/create", isUserLoggedIn, createOrder);
router.get("/orders", isUserLoggedIn, getOrders);
router.delete("/orders/:id/cancel", isUserLoggedIn, cancelOrder);
router.put("/order/:id/delivered", isUserLoggedIn, markDelivered);

router.get("/admin/users", isUserLoggedIn, getAllUsers);
router.get("/admin/products", isUserLoggedIn, getAllProducts);
router.get("/admin/orders/:id", isUserLoggedIn, getOrdersAdmin);

module.exports = router;
