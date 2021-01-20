// const { model, Schema , Mongoose } = require("mongoose");
const mongoose = require("mongoose");
const stripePrices = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    products: [{
        productId: String,
        priceId: String,
        quantity: Number,
    }, ],
}, { timestamps: true });

const stripePricesModel = mongoose.model("stripe-prices", stripePrices);
module.exports = stripePricesModel;