const Order = require("../models/orderModel");
const User = require("../models/userModel");

// ✅ FIXED: Create order with "placed" status (not shipped)
module.exports.createOrder = async (req, res) => {
  try {
    const { paymentMethod, totalAmount } = req.body;
    const userId = req.user?._id;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!paymentMethod || !totalAmount)
      return res
        .status(400)
        .json({ message: "paymentMethod and totalAmount required" });

    const user = await User.findById(userId).populate("cart");
    if (!user) return res.status(404).json({ message: "User not found" });

    const products = user.cart.map((cartItem) => ({
      product: cartItem.product || cartItem._id,
    }));
    if (products.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const defaultAddress = user.addresses?.find((addr) => addr.isDefault);
    if (!defaultAddress)
      return res.status(400).json({ message: "No default address found" });

    const order = await Order.create({
      user: userId,
      products,
      address: defaultAddress._id,
      paymentMethod,
      totalAmount: Number(totalAmount),
      orderStatus: "placed", // ✅ FIXED: Start with "placed"
      paymentStatus: "pending",
    });

    user.cart = [];
    await user.save();

    await order.populate([
      {
        path: "products.product",
        select: "title price discount image averageRating",
      },
      { path: "address", select: "street city state pincode phone" },
      { path: "user", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
      order,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports.getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ message: "User ID Required" });

    const orders = await Order.find({ user: userId })
      .populate(
        "products.product",
        "image title category subCategory discount offers description"
      )
      .sort({ createdAt: -1 });

    const user = await User.findById(userId).select("name email addresses");

    const ordersWithImagesAndAddress = await Promise.all(
      orders.map(async (order) => {
        const matchedAddress = user.addresses?.find(
          (addr) => addr._id.toString() === order.address?.toString()
        );
        const productsWithImages = order.products.map((product) => {
          if (product?.product?.image?.data) {
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
        });

        return {
          ...order._doc,
          user: { name: user.name, email: user.email },
          address: matchedAddress || null,
          products: productsWithImages,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithImagesAndAddress,
      count: ordersWithImagesAndAddress.length,
    });
  } catch (error) {
    console.error("Fetching Orders error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Matches PUT /order/:id/delivered (singular)
module.exports.markDelivered = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "User login required" });

    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });
    if (order.orderStatus !== "shipped")
      return res.status(400).json({ message: "Order must be shipped first" });

    order.orderStatus = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    res.json({ message: "Order marked as delivered", orderId });
  } catch (error) {
    console.error("Mark delivered error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Matches DELETE /orders/:id/cancel
module.exports.cancelOrder = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "User login required" });

    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this order" });
    if (!["placed", "confirmed"].includes(order.orderStatus))
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res
      .status(200)
      .json({ message: "Order cancelled successfully", orderId: order._id });
  } catch (error) {
    console.error("Cancelling Order error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
