const cartModel = require("../../newCart/schema")
const objectId = require('mongodb').ObjectID;

const cart = async () => {
    const carts = await cartModel.find().populate({
        path: "items.productId",
        select: "name price total quantity"
    });;
    return carts[0];
};




const carts = async () => {
    const carts = new cartModel()
    return carts
}

const addItem = async payload => {
    const newCart = new cartModel()
    newCart._id = objectId(payload.id)
    newCart.items[0].quantity = payload.items[0].quantity
    newCart.items[0].total = payload.items[0].total
    newCart.items[0].price = payload.items[0].price
    newCart.subTotal = payload.subTotal
    newItem = await newCart.save()
    return newItem
}


const calculateTotal = (price, quantity) => {
     return total = price * quantity
}

const increaseQuantity = (quantity) => {
    return newQuantity = quantity + 1
}

const decreaseQuantity = (quantity) => {
    if (quantity === 0) {
        return "Quantity Cannot be less than 1"
    }
    else {
        return quantity--
    }
}

module.exports = {
    calculateTotal, increaseQuantity,
    decreaseQuantity , cart , addItem
}