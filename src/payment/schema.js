// const { model, Schema , Mongoose } = require("mongoose");
const mongoose = require('mongoose')
const orderAddress = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    email: { type: String, required: true },
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    billingAddressFullName: { type: String, required: true },
    billingAddressaddressLine1: { type: String, required: true },
    billingAddresscity: { type: String, required: true },
    billingAddresspostCode: { type: String, required: true },
    billingAddressemail: { type: String, required: true },
}, { timestamps: true }, )

const stripePricesModel = mongoose.model('order-address', orderAddress)
module.exports = stripePricesModel