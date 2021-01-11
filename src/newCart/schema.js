const { model, Schema , mongoose} = require("mongoose");


const cartSchema = new Schema({
    subTotal: {
        default: 0,
        type: Number
    },
    items: [{
        productId: { type: String, required: true },
        quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less then 1.'] ,
        default : 1
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    }
    }
    ]
})

const newCartModel = model("carts", cartSchema);

module.exports = newCartModel;