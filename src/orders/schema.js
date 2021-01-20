// const { model, Schema , Mongoose } = require("mongoose");
const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },

    status: { type: String, required: true },
    product: [{
        productId: String,
        quantity: Number,
        name: String,
        price: Number,
        total: Number,
    }],
    date: { type: String, required: true },
    time: { type: String, required: true },

}, { timestamps: true });

const orderModel = mongoose.model("orders", orderSchema);
module.exports = orderModel;