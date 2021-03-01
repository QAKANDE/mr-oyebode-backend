const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    sizeAsString: { type: String, required: true },
    sizes: [],
}, { timestamps: true });



const product = mongoose.model("product", productSchema);
module.exports = product;