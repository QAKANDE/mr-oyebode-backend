const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    status: { type: String, default: "Not Delivered" },
    deliveryAddress: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        country: { type: String, required: true },
        county: { type: String, required: true },
        postCode: { type: String, required: true },
    },
    product: [{
        productId: String,
        quantity: Number,
        name: String,
        price: Number,
        size: String,
        color: String,
        image: String,
        total: Number,
    }, ],
    date: { type: String, required: true },
    time: { type: String, required: true },
    subTotal: { type: Number, required: true },
}, { timestamps: true });

const orderModel = mongoose.model("orders", orderSchema);
module.exports = orderModel;