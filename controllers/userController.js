const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path:'/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports.registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("All fields required");
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists, Try Logging in!");
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      name,
      email,
      password: hash,
    });

    if (!createdUser) {
      console.log("Unable to register user");
      return res.status(500).json({ message: "User registration failed" });
    }

    const token = generateToken(createdUser._id);

    res.cookie("token", token, cookieOptions);

    console.log("User registered successfully");

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (error) {
    console.log("Failed to login user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      console.log("Email and password required");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found, please register first");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    console.log(req.user);
    console.log("User logged in successfully");
    return res.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
      },
    });
  } catch (error) {
    console.log("Failed to login user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    console.log("User logged out");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Failed to login user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id; // From auth middleware

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name and email (always allowed)
    user.name = name || user.name;
    user.email = email || user.email;

    // Handle password update
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Check if new password matches confirmation (frontend handles this)
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Save updated user
    await user.save();

    // Generate new JWT (if password changed)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // Send new token if password changed
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

module.exports.updateCompanyDetails = async (req, res) => {
  try {
    console.log("USER:", req.user);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, description, address } = req.body;

    if (!name || !description || !address) {
      return res.status(400).json({
        success: false,
        message: "All company fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Company logo is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        isSeller: true,
        company: {
          name,
          description,
          address,
          logo: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company registered successfully. User is now a seller.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.getSellerCompany = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.isSeller) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access company details",
      });
    }

    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: "Company details not found",
      });
    }

    const company = {
      name: user.company.name,
      description: user.company.description,
      address: user.company.address,
      logo: user.company.logo?.data
        ? user.company.logo.data.toString("base64")
        : null,
      contentType: user.company.logo?.contentType || null,
    };

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.getSellerProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Login required" });
    }

    if (!req.user.isSeller) {
      return res.status(403).json({ message: "Not a seller" });
    }

    const products = await Product.find({ owner: req.user._id });

    const formattedProduct = products.map((product) => {
      let imageBase64 = null;

      if (product.image.data) {
        imageBase64 = `data:${
          product.image.contentType
        };base64,${product.image.data.toString("base64")}`;
      }

      return {
        ...product.toObject(),
        image: imageBase64,
      };
    });

    res.status(200).json({
      success: true,
      products: formattedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.addToWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const index = user.wishlist.findIndex(
      (wishId) => wishId.toString() === productId,
    );

    // TOGGLE LOGIC (NO DUPLICATES)
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      wishlisted: index === -1,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.getWishlistedProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "wishlist",
      select:
        "title price discount category subCategory averageRating image offers",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wishlist = user.wishlist || [];

    const formattedWishlist = wishlist.map((product) => {
      const formattedProduct = {
        _id: product._id,
        title: product.title,
        price: product.price,
        discount: product.discount || null,
        category: product.category,
        subCategory: product.subCategory,
        averageRating: product.averageRating,
        offers: product.offers || null,
      };

      if (product.image?.data && product.image?.contentType) {
        formattedProduct.image = {
          base64: product.image.data.toString("base64"),
          contentType: product.image.contentType,
        };
      }

      return formattedProduct;
    });

    return res.status(200).json({
      success: true,
      count: formattedWishlist.length,
      products: formattedWishlist,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove the product from wishlist
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.addToCart = async (req, res) => {
  try {
    const { id: productId } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyInCart = user.cart.some((id) => id.toString() === productId);

    if (!alreadyInCart) {
      user.cart.push(productId);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadyInCart
        ? "Product already in cart"
        : "Product added to cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.getCartProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "cart",
      select:
        "title price discount category subCategory averageRating image offers target",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cart = user.cart || [];

    const formattedCart = cart.map((product) => {
      const formattedProduct = {
        _id: product._id,
        title: product.title,
        price: product.price,
        discount: product.discount || null,
        category: product.category,
        subCategory: product.subCategory,
        averageRating: product.averageRating,
        offers: product.offers || null,
        target: product.target || null,
      };

      if (product.image?.data && product.image?.contentType) {
        formattedProduct.image = {
          base64: product.image.data.toString("base64"),
          contentType: product.image.contentType,
        };
      }

      return formattedProduct;
    });

    return res.status(200).json({
      success: true,
      addressLength: req.user.addresses.length,
      count: formattedCart.length,
      products: formattedCart,
    });
  } catch (error) {
    console.error("Cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const initialLength = user.cart.length;

    user.cart = user.cart.filter(
      (id) => id.toString() !== productId.toString(),
    );

    if (user.cart.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.addUserAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone, street, city, state, pincode, isDefault } = req.body;

    if (!phone || !street || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // If new address is default, unset previous defaults
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // Add new address
    user.addresses.push({
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    });

    await user.save();

    return res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.removeFromAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address ID" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );
    if (addressIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    user.addresses.splice(addressIndex, 1); // remove the address

    // If deleted address was default and any addresses remain, set the first as default
    if (
      user.addresses.length > 0 &&
      !user.addresses.some((addr) => addr.isDefault)
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Remove address error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getAllAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId, "addresses");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.setAddressAsDefault = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let addressFound = false;

    user.addresses = user.addresses.map((addr) => {
      if (addr._id.toString() === addressId) {
        addressFound = true;
        return { ...addr.toObject(), isDefault: true };
      }
      return { ...addr.toObject(), isDefault: false };
    });

    if (!addressFound) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getOrderSummary = async (req, res) => {
  try {
    const userDetails = req.user;

    return res.status(200).json({
      suceess: true,
      user: userDetails,
    });
  } catch (error) {
    console.log("Order Summary Error", error);
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all users (exclude password and sensitive fields)
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.getOrdersAdmin = async (req, res) => {
  try {
    // Check if admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Fetch orders with populated products
    const orders = await Order.find({ user: userId })
      .populate(
        "products.product",
        "image title category subCategory discount offers description",
      )
      .sort({ createdAt: -1 });

    // Convert product images to base64
    const ordersWithBase64Images = orders.map((order) => ({
      ...order._doc,
      products: order.products.map((product) => {
        if (product.product?.image?.data) {
          return {
            ...product._doc,
            product: {
              ...product.product._doc,
              image: {
                base64: product.product.image.data.toString("base64"),
                contentType: product.product.image.contentType,
              },
            },
          };
        }
        return product;
      }),
    }));

    res.status(200).json({
      success: true,
      orders: ordersWithBase64Images,
      count: ordersWithBase64Images.length,
    });
  } catch (error) {
    console.error("Fetching orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    // REQUIRED: Admin check
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Search query
    const search = req.query.search || "";
    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch paginated products
    const products = await Product.find(searchQuery)
      .select(
        "title description category subCategory price discount offers specs image",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for pagination
    const total = await Product.countDocuments(searchQuery);

    // Convert images to base64
    const productsWithBase64 = products.map((product) => ({
      ...product._doc,
      image: product.image?.data
        ? {
            base64: product.image.data.toString("base64"),
            contentType: product.image.contentType,
          }
        : null,
    }));

    res.json({
      success: true,
      message: "Products fetched successfully",
      count: productsWithBase64.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + productsWithBase64.length < total,
      products: productsWithBase64,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// module.exports.isAnyOneLoggedIn = async (req, res) => {
//   return res.status(200).json({
//     success: true,
//     user: req.account,
//     role: req.role,
//   });
// };
