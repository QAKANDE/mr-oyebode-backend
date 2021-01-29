const { model, Schema } = require("mongoose");
const mongoose = require("mongoose");
const userOrderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    products: [{
        productId: String,
        quantity: Number,
        image: String,
        name: String,
        size: String,
        color: String,
        price: Number,
        total: Number,
        date: String,
        time: String,
    }, ],
});

const userOrderModel = model("user-orders", userOrderSchema);

module.exports = userOrderModel;