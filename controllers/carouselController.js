const Carousel = require("../models/carousel");

module.exports.createCarousel = async (req, res) => {
  try {
    // 1. Admin check
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    // 2. Check if a carousel already exists
    const existing = await Carousel.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Carousel already exists. Please update it instead.",
      });
    }

    // 3. Validate files
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    if (req.files.length > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum 5 images allowed" });
    }

    // 4. Validate product links
    let { productLinks } = req.body;

    if (!productLinks) {
      return res
        .status(400)
        .json({ success: false, message: "Product links are required" });
    }

    productLinks = JSON.parse(productLinks);

    if (!Array.isArray(productLinks)) {
      return res
        .status(400)
        .json({ success: false, message: "Product links must be an array" });
    }

    if (productLinks.length !== req.files.length) {
      return res.status(400).json({
        success: false,
        message: "Product links count must match images count",
      });
    }

    // 5. Build carousel items
    const items = req.files.map((file, index) => ({
      image: file.buffer,
      productLink: productLinks[index],
    }));

    // 6. Create carousel
    const carousel = await Carousel.create({ items });

    return res
      .status(201)
      .json({ success: true, message: "Carousel created", data: carousel });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.updateCarousel = async (req, res) => {
  try {
    // 1. Admin check
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res
        .status(404)
        .json({ success: false, message: "Carousel not found" });
    }

    let { productLinks } = req.body;

    if (!productLinks) {
      productLinks = []; // default empty array
    } else {
      productLinks = JSON.parse(productLinks);
    }

    // Loop through existing items and update only those with new data
    carousel.items = carousel.items.map((item, index) => {
      // If a new image is uploaded at this index
      const newImage = req.files?.[index]?.buffer || item.image;

      // If a new link is provided at this index
      const newLink = productLinks[index] || item.productLink;

      return {
        image: newImage,
        productLink: newLink,
      };
    });

    // Handle adding new items if more images/links sent
    if (req.files && req.files.length > carousel.items.length) {
      for (let i = carousel.items.length; i < req.files.length; i++) {
        carousel.items.push({
          image: req.files[i].buffer,
          productLink: productLinks[i],
        });
      }
    }

    await carousel.save();

    res.json({ success: true, message: "Carousel updated", data: carousel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getAdminCarousel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne({}, { "items.image": 0 });
    // do NOT send buffer to frontend

    res.json({
      success: true,
      data: carousel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getCarousel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res
        .status(404)
        .json({ success: false, message: "Carousel not found" });
    }

    // Convert buffers to Base64 strings
    const items = carousel.items.map((item) => ({
      productLink: item.productLink,
      image: `data:image/png;base64,${item.image.toString("base64")}`, // adjust mime type if needed
    }));

    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin check
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Carousel ID is required",
      });
    }

    const deletedCarousel = await Carousel.findByIdAndDelete(id);

    if (!deletedCarousel) {
      return res.status(404).json({
        success: false,
        message: "Carousel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Carousel deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
