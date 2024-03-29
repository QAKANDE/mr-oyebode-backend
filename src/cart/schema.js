const mongoose = require('mongoose')

const cart2Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    totalItems: Number,
    products: [{
        productId: String,
        quantity: Number,
        image: String,
        name: String,
        price: Number,
        total: Number,
        size: { type: String, default: 'None selected' },
        color: { type: String, default: 'None selected' },
        stock: [],
    }, ],

    active: {
        type: Boolean,
        default: true,
    },
    modifiedOn: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true }, )

cart2Schema.pre('save', async function(next) {
    this.totalItems = this.products.length
    next()
})

module.exports = mongoose.model('cart', cart2Schema)