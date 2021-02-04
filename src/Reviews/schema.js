// const { model, Schema , Mongoose } = require("mongoose");
const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    width: {
        type: String,
        required: true,
    },
    ratings: {
        type: Number,
        default: 1,
    },
}, { timestamps: true });

const reviewModel = mongoose.model("reviews", reviewSchema);
module.exports = reviewModel;