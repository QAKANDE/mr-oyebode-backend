const mongoose = require('mongoose')
const stripeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [{ productId: String, priceId: String, quantity: String }],
}, { timestamps: true }, )

const stripesModel = mongoose.model('stripes', stripeSchema)
module.exports = stripesModel