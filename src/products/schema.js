const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        default: '20',
    },
    images: [{
        imageUrl: { type: String, required: true },
    }, ],
    stock: [{
        colors: [{
            color: String,
            sizes: [{
                size: String,
                quantity: String,
            }, ],
        }, ],
    }, ],
    description: [],

    sizeAsString: { type: String, required: true },
    sizes: [],
}, { timestamps: true }, )

const product = mongoose.model('product', productSchema)
module.exports = product