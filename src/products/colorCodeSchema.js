const mongoose = require('mongoose')

const colorSchema = new mongoose.Schema({
    title: { type: String, required: true },
    colorCode: { type: String, required: true },
    url: { type: String, required: true },
}, { timestamps: true }, )

const color = mongoose.model('color-codes', colorSchema)
module.exports = color