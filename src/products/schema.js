const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        default: '20',
    },
    imageUrl: { type: String, required: true },
    stock: [{
        color: String,
        sizes: [{ size: String, quantity: String }],
    }, ],
    description: [],
}, { timestamps: true }, )

const product = mongoose.model('product', productSchema)
module.exports = product