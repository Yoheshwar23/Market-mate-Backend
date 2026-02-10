const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: { type: String, unique: true },

    password: String,

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    orders: [
      {
        products: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            quantity: {
              type: Number,
              default: 1,
            },
          },
        ],

        address: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        status: {
          type: String,
          enum: ["placed", "cancelled", "delivered"],
          default: "placed",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isSeller: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    sellingProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    company: {
      name: { type: String, default: "" },
      description: { type: String, default: "" },
      address: { type: String, default: "" },
      logo: {
        data: Buffer,
        contentType: String,
      },
    },

    addresses: [
      {
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
