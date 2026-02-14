const mongoose = require("mongoose");
const Product = require("../models/productModel");
const User = require("../models/userModel");

module.exports.createProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    if (!req.user.isSeller) {
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can create products" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    let {
      title,
      description,
      offers,
      category,
      subCategory,
      price,
      discount,
      specs,
      target,
    } = req.body;

    // 🔥 Parse FormData JSON
    specs = specs ? JSON.parse(specs) : [];
    offers = offers ? JSON.parse(offers) : [];

    if (!title || !description || !category || !subCategory || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const product = new Product({
      title,
      description,
      category,
      subCategory,
      price: Number(price),
      discount: Number(discount) || 0,
      target: target?.trim() ? target : undefined,
      specs,
      offers,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      owner: req.user._id,
    });

    await product.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { sellingProducts: product._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

module.exports.filterProducts = async (req, res) => {
  try {
    let {
      title,
      description,
      category,
      subCategory,
      specs,
      maxPrice,
      minPrice,
      discount,
      target,
    } = req.query;

    let filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (description) {
      filter.description = { $regex: description, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    if (specs) {
      filter["specs.value"] = { $regex: specs, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (discount === "true") {
      filter.discount = { $gt: 0 };
    }

    if (target) {
      filter.target = target;
    }

    const products = await Product.find(filter);

    const formattedProducts = products.map((product) => {
      const data = {
        _id: product._id,
        title: product.title,
        price: product.price,
        target: product.target || null,
        discount: product.discount || null,
        offers: product.offers || null,
      };

      if (product.image?.data && product.image?.contentType) {
        data.image = {
          base64: product.image.data.toString("base64"),
          contentType: product.image.contentType,
        };
      }

      return data;
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
      error: error.message,
    });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔐 Auth & ownership
    if (!req.user || !req.user._id || !req.user.isSeller) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update products",
      });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    let {
      title,
      description,
      offers,
      category,
      subCategory,
      price,
      discount,
      specs,
      target,
    } = req.body;

    // ✅ Only parse if actually sent
    if (specs !== undefined) {
      specs = specs ? JSON.parse(specs) : [];
      product.specs = specs;
    }

    if (offers !== undefined) {
      offers = offers ? JSON.parse(offers) : [];
      product.offers = offers;
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (target !== undefined) product.target = target.trim() || null;

    // 🖼 Image update (optional)
    if (req.file?.buffer) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
      error: error.message,
    });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: deleted,
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
      error: error.message,
    });
  }
};

module.exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subCategory: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = products.map((product) => {
      const data = {
        _id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
        subCategory: product.subCategory,
        description: product.description,
        target: product.target ?? null,
        offers: product.offers ?? null,
        discount: product.discount ?? null,
      };

      if (product.image?.data && product.image?.contentType) {
        data.image = {
          base64: product.image.data.toString("base64"),
          contentType: product.image.contentType,
        };
      }

      return data;
    });

    return res.status(200).json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(id).populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const formattedProduct = {
      _id: product._id,
      title: product.title,
      description: product.description,
      target: product.target || null,
      offers: product.offers || null,
      category: product.category,
      price: product.price,
      subCategory: product.subCategory,
      discount: product.discount || null,
      specs: product.specs,
      reviews: product.reviews, // NOW populated
      averageRating: product.averageRating,
      comments: product.comments,
      createdAt: product.createdAt,
    };

    if (product.image?.data && product.image?.contentType) {
      formattedProduct.image = {
        base64: product.image.data.toString("base64"),
        contentType: product.image.contentType,
      };
    }

    return res.status(200).json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports.addOrUpdateReview = async (req, res) => {
  try {
    // 1. Auth safety
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user._id;
    const productId = req.params.id;
    const { rating, comment } = req.body;

    // 2. Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    // 3. Fetch product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 4. Add or update review (1 review per user)
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.createdAt = new Date();
    } else {
      product.reviews.push({
        user: userId,
        rating,
        comment,
        createdAt: new Date(),
      });
    }

    // 5. Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);

    product.averageRating = Number(
      (totalRating / product.reviews.length).toFixed(1)
    );

    // 6. Save product
    await product.save();

    // 7. Populate user names for frontend consistency
    const populatedProduct = await Product.findById(productId).populate(
      "reviews.user",
      "name"
    );

    // 8. Response
    return res.status(200).json({
      success: true,
      averageRating: populatedProduct.averageRating,
      reviews: populatedProduct.reviews,
    });
  } catch (error) {
    console.error("Review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
