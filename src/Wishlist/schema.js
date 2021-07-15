const mongoose = require('mongoose')

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [{
        productId: String,
        image: String,
        name: String,
        price: Number,
    }, ],
})

module.exports = mongoose.model('wishlist', wishListSchema)