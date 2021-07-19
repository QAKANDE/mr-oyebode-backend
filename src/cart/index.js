const express = require('express')
const router = express.Router()
const cartModel = require('./schema')
const productModel = require('../products/schema')
const objectId = require('mongodb').ObjectID
const { findByIdAndUpdate } = require('./schema')
const shortId = require('short-id')
const idsModel = require('./idModel')
var mongoose = require('mongoose')

// const generateId = () => {
// var i
//   for (i = 0; i < 100; i++) {
//   shortId.configure({
//       length: 24,
//       algorithm: 'sha1',
//     });
//     const id = shortId.generate()
//     // const idss = await idsModel()
//     // idss._id = objectId(id)
//     // const ress = await idss.save()

// }
// }

//  let i

//   for (i = 0; i < 100; i++){
//     var id = new mongoose.mongo.ObjectId();
//    const idss = await idsModel()
//     idss._id = objectId(id)
//   const ress = await idss.save()
//   }
//   res.send("sucess")

router.get('/:userId', async(req, res) => {
    const userId = req.params.userId
    const cartperUser = await cartModel.findOne({ userId })
    if (cartperUser) {
        res.send(cartperUser)
    } else {
        res.send('No Items In Cart')
    }
})

router.post('/cart/:userId', async(req, res) => {
    const { productId, quantity, name, price } = req.body
    const total = parseInt(price * req.body.quantity)
    const userId = req.params.userId

    try {
        let cart = await cartModel.findOne({ userId })

        if (cart) {
            //cart exists for user
            let itemIndex = cart.products.findIndex((p) => p.productId == productId)

            if (itemIndex > -1) {
                //product exists in the cart, update the quantity
                let productItem = cart.products[itemIndex]
                productItem.quantity++
                    newTotal = parseInt(productItem.quantity * productItem.price)
                productItem.total = newTotal
                cart.products[itemIndex] = productItem
            } else {
                //product does not exists in cart, add new item
                cart.products.push({ productId, quantity, name, price, total })
            }
            cart = await cart.save()
            newSubTotal = cart.products
                .map((item) => item.total)
                .reduce((acc, next) => acc + next)
            res.json({
                cart,
                SubTotal: newSubTotal,
            })
        } else {
            //no cart for user, create new cart
            const newCart = await cartModel.create({
                userId,
                products: [{ productId, quantity, name, price, total }],
            })

            return res.status(201).send(newCart)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send('Something went wrong')
    }
})

router.get('/guest/guest-token', async(req, res) => {
    const tokenArray = []
    const tokens = await idsModel.find()
    const guestToken = tokens[0]._id
        // const deleteToken = await idsModel.findByIdAndDelete(tokens[0]._id);
    res.send(guestToken)

    // const newId = await new idsModel();
    // newId.user = "guestUser";
    // res.json({
    //     id: newId._id,
    // });
})
router.post('/check-out-as-guest', async(req, res) => {
    try {
        const {
            productId,
            quantity,
            image,
            name,
            size,
            stock,
            color,
            price,
            sizeFromClient,
            userId,
        } = req.body
        if (sizeFromClient) {
            // const sizes = sizeFromClient.split('')
            const total = parseInt(price * req.body.quantity)
            let cart = await cartModel.findOne({ userId })

            if (cart) {
                let itemIndex = cart.products.findIndex((p) => p.productId == productId)

                if (itemIndex > -1) {
                    let productItem = cart.products[itemIndex]
                    productItem.quantity = quantity
                    newTotal = parseInt(productItem.quantity * productItem.price)
                    productItem.total = newTotal
                    cart.products[itemIndex] = productItem
                    console.log(quantity)
                        // let productItem = cart.products[itemIndex];
                        // productItem.quantity++;
                        // newTotal = parseInt(productItem.quantity * productItem.price)
                        // productItem.total = newTotal
                        // cart.products[itemIndex] = productItem;
                } else {
                    cart.products.push({
                        productId,
                        quantity,
                        image,
                        name,
                        size,
                        color,
                        price,
                        total,
                        stock,
                    })
                }
                cart = await cart.save()
                await cartModel.findByIdAndUpdate(cart._id, {
                    totalItems: cart.products.length,
                })
                newSubTotal = cart.products
                    .map((item) => item.total)
                    .reduce((acc, next) => acc + next)
                res.json({
                    cart,
                    SubTotal: newSubTotal,
                })
            } else {
                const newCart = await cartModel.create({
                    userId,
                    products: [{
                        productId,
                        quantity,
                        image,
                        name,
                        size,
                        color,
                        price,
                        total,
                        stock,
                    }, ],
                })

                return res.status(201).send(newCart)
            }
        } else {
            const total = parseInt(price * req.body.quantity)
            let cart = await cartModel.findOne({ userId })

            if (cart) {
                let itemIndex = cart.products.findIndex((p) => p.productId == productId)

                if (itemIndex > -1) {
                    let productItem = cart.products[itemIndex]
                    productItem.quantity = quantity
                    newTotal = parseInt(productItem.quantity * productItem.price)
                    productItem.total = newTotal
                    cart.products[itemIndex] = productItem

                    // let productItem = cart.products[itemIndex];
                    // productItem.quantity++;
                    // newTotal = parseInt(productItem.quantity * productItem.price)
                    // productItem.total = newTotal
                    // cart.products[itemIndex] = productItem;
                } else {
                    cart.products.push({
                        productId,
                        quantity,
                        image,
                        name,
                        size,
                        color,
                        price,
                        total,
                        stock,
                    })
                }
                cart = await cart.save()
                await cartModel.findByIdAndUpdate(cart._id, {
                    totalItems: cart.products.length,
                })
                newSubTotal = cart.products
                    .map((item) => item.total)
                    .reduce((acc, next) => acc + next)
                res.json({
                    cart,
                    SubTotal: newSubTotal,
                })
            } else {
                const newCart = await cartModel.create({
                    userId,
                    products: [{
                        productId,
                        quantity,
                        image,
                        name,
                        size,
                        color,
                        price,
                        total,
                        stock,
                    }, ],
                })

                return res.status(201).send(newCart)
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send('Something went wrong')
    }
})

router.put('/edit-product-size/:userId/:productId', async(req, res) => {
    const { size } = req.body
    const { user } = req.params.userId

    try {
        let cart = await cartModel.findOne({ user })

        cartModel.updateOne({ 'products.productId': req.params.productId }, {
                $set: {
                    'products.$.size': size,
                },
            },
            function(err, model) {
                if (err) {
                    console.log(err)
                    return res.send(err)
                } else {
                    return res.json(model)
                }
            },
        )
    } catch (error) {
        console.log(error)
    }
})

router.delete('/delete-item/:userId/:productId', async(req, res) => {
    const { user } = req.params.userId
    const cart = await cartModel.findOne({ user })
    previousTotalItems = cart.totalItems

    cartModel.findOneAndUpdate({ _id: cart._id }, {
            $pull: { products: { _id: req.params.productId } },
            totalItems: previousTotalItems - 1,
        },
        false,
        function(err, data) {
            if (err) {
                console.log(err)
            } else {
                res.send(data)
            }
        },
    )
})

router.delete('/guest-cart-token-delete', async(req, res) => {
    const tokenToBeDeleted = await idsModel.findByIdAndDelete(req.body.token)
    const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
    if (tokenToBeDeleted || cartToBeDeleted) {
        res.send('Check Out Token And Cart Deleted')
    }
})

router.delete('user-cart-delete', async(req, res) => {
    const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
    if (cartToBeDeleted) {
        res.send('Cart Deleted')
    } else {
        res.send("Cart Doesn't exist")
    }
})

module.exports = router