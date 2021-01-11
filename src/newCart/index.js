const express = require("express");
const router = express.Router()
const cartModel = require("../cart/schema")
const productModel = require("../products/schema")
const objectId = require('mongodb').ObjectID;
const  populateCartFunction = require("../cart/helpers/functions")


router.post("/new-cart/:userId", async (req, res) => {
    const productDetails = await productModel.findById(req.body.productId)
    const quantity = Number.parseInt(req.body.quantity);
    if (productDetails) {
        const cartPerUser = await cartModel.findById(req.params.userId)
        if (!cartPerUser) {
             const cartData = {
                 _id: objectId(req.params.userId),
                 subTotal: parseInt(productDetails.price * quantity),
                 productName : productDetails.name ,
                    items: [{
                        productId: req.body.productId,
                        quantity: quantity,
                        total: parseInt(productDetails.price * quantity),
                        price: productDetails.price,
                        
                    }],  
            }
            const newCart = new cartModel(cartData)
            const cartToBeSent = await newCart.save()
            res.send(cartToBeSent)
        }
        else if (cartPerUser) {
            const productName = cartPerUser.items.map((item) => {
                if (item.productId === req.body.productId) {
                    item.quantity++
                    item.total = parseInt(item.quantity * productDetails.price)
                    cartPerUser.subTotal = parseInt(item.quantity * productDetails.price)
                    const updateCart = await cartModel.findOneAndUpdate({ 'items._id': cartPerUser.items[0]._id }, {
                        
                    })
                }
            })  
        }
       
        
    }
})


module.exports = router