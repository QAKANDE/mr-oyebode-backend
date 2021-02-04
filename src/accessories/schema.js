const mongoose = require("mongoose");
const accesorriesSchema = new mongoose.Schema({
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
    },
    size: {
        type: String,
    },
}, { timestamps: true });

const accesorries = mongoose.model("accessories", accesorriesSchema);
module.exports = accesorries;