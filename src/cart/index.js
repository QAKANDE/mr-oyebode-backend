const express = require("express");
const router = express.Router()
const cartModel = require("./schema")
const productModel = require("../products/schema")
const objectId = require('mongodb').ObjectID;
const { findByIdAndUpdate } = require("./schema");
const shortId = require("short-id")
const idsModel = require("./idModel")

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

router.post("/cart/:userId", async (req, res) => {
    const { productId, quantity, name, price } = req.body;
    const total = parseInt(price * req.body.quantity)
    const userId = req.params.userId; //TODO: the logged in user id

  try {
    let cart = await cartModel.findOne({ userId });

    if (cart) {
      //cart exists for user
      let itemIndex = cart.products.findIndex(p => p.productId == productId);

      if (itemIndex > -1) {
        //product exists in the cart, update the quantity
        let productItem = cart.products[itemIndex];
        productItem.quantity++;
        newTotal = parseInt(productItem.quantity * productItem.price)
        productItem.total = newTotal
        cart.products[itemIndex] = productItem;
      } else {
        //product does not exists in cart, add new item
          cart.products.push({ productId, quantity, name, price, total });
      }
        cart = await cart.save();
        newSubTotal = cart.products.map(item => item.total).reduce((acc, next) => acc + next);
        res.json({
            cart, 
            SubTotal : newSubTotal
        })
    } else {
      //no cart for user, create new cart
      const newCart = await cartModel.create({
        userId,
        products: [{ productId, quantity, name, price , total }]
      });

      return res.status(201).send(newCart);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});


router.post("/check-out-as-guest", async (req, res) => {

  const tokenArray = []
  const tokens = await idsModel.find()
  const { productId, quantity, name, price } = req.body;
  const userId = tokens[0]._id
    const total = parseInt(price * req.body.quantity)
  try {
    let cart = await cartModel.findOne({ userId });
    if (cart) {
     
      let itemIndex = cart.products.findIndex(p => p.productId == productId);

      if (itemIndex > -1) { 
        let productItem = cart.products[itemIndex];
        productItem.quantity++;
        newTotal = parseInt(productItem.quantity * productItem.price)
        productItem.total = newTotal
        cart.products[itemIndex] = productItem;
      } else {
       
          cart.products.push({ productId, quantity, name, price, total });
      }
        cart = await cart.save();
        newSubTotal = cart.products.map(item => item.total).reduce((acc, next) => acc + next);
        res.json({
            cart, 
            SubTotal: newSubTotal, 
        })
    } else {
      const newCart = await cartModel.create({
        userId,
        products: [{ productId, quantity, name, price , total }]
      });

      return res.status(201).send(newCart);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
})

router.delete("/guest-cart-token-delete", async (req, res) => {
  const tokenToBeDeleted = await idsModel.findByIdAndDelete(req.body.token)
  const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
  if (tokenToBeDeleted || cartToBeDeleted) {
    res.send("Check Out Token And Cart Deleted")  
  }
})

router.delete("user-cart-delete", async (req, res) => {
  const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
  if (cartToBeDeleted) {
    res.send("Cart Deleted")
  }
  else {
    res.send("Cart Doesn't exist")
  }
})

module.exports = router