const mongoose = require("mongoose");

const carouselItemSchema = new mongoose.Schema({
  image: {
    type: Buffer,
    required: true,
  },
  productLink: {
    type: String,
    required: true,
  },
});

const carouselSchema = new mongoose.Schema(
  {
    items: {
      type: [carouselItemSchema],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Carousel can contain max 5 images only",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", carouselSchema);
