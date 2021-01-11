const mongoose = require("mongoose");

const cart2Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [
      {
        productId: String,
        quantity: Number,
        name: String,
        price: Number ,
        total : Number
      }
        ],
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart2", cart2Schema);