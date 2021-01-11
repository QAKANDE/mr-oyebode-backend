const { model, Schema , mongoose} = require("mongoose");

const itemsSchema = new Schema({
   productId: {
        type: String,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less then 1.']
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
} , {_id : false })
const CartSchema = new Schema({
    items: [itemsSchema],
    subTotal: {
        default: 0,
        type: Number
    }
}, {
    timestamps: true
})
const cartSchemaModel = model("cart", CartSchema);

module.exports = cartSchemaModel;