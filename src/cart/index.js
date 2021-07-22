const express = require('express')
const router = express.Router()
const cartModel = require('./schema')
const productModel = require('../products/schema')
const orderAddressModel = require('../payment/schema')
const objectId = require('mongodb').ObjectID
const { findByIdAndUpdate } = require('./schema')

const idsModel = require('./idModel')
var mongoose = require('mongoose')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
    const translator = short()
    res.json({
        id: translator.new(),
    })
})

router.post('/transactional-email-customer', async(req, res) => {
            const { customerEmail, id, orderId } = req.body

            const cart = await cartModel.findById(id)

            newSubTotal = cart.products
                .map((item) => item.total)
                .reduce((acc, next) => acc + next)
            const total = newSubTotal + 4.99

            const msg = {
                    to: customerEmail,
                    from: 'info@johnpaulstephen.com',
                    subject: 'Thank you for your order',
                    html: `<div>
                    <h2>Thank you for your order</h2>
                    <h2>These are your order details</h2>
                        ${cart.products.map((arr) => {
                          return `<div>
                <img src=${arr.image} style="width:50%; height:50%;"></img>
                <p>Product name : ${arr.name}</p>
                <p>Size : ${arr.size}</p>
                <p>Quantity: ${arr.quantity}</p>
                <p>Price: ${arr.price}</p>
                <p>Subtotal: ${arr.total}</p>
                <div>
                </div>
                </div>`
                        })}
                        <p>Shipping cost: 4.99</p>
                        <p>Total: ${total}</p>
                        <img style="width:50%; height:50%;" src="https://res.cloudinary.com/quadri/image/upload/v1626724740/JOHN_PAUL_STEPHEN_2_LR_BLACK_rfiw11.png"></img>
                        </div>`,
  }
  sgMail
    .send(msg)
    .then(async () => {
      const cartToBeDeleted = await cartModel.findByIdAndDelete(id)
      const orderAddressToBeDeleted = await orderAddressModel.findByIdAndDelete(
        orderId,
      )
      res.send('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
})

router.post('/transactional-email-to-sales', async (req, res) => {
  const { id } = req.body

  const cart = await cartModel.findById(id)

  newSubTotal = cart.products
    .map((item) => item.total)
    .reduce((acc, next) => acc + next)
  const total = newSubTotal + 4.99

  const msg = {
    to: 'sales@johnpaulstephen.com',
    from: 'info@johnpaulstephen.com',
    subject: 'New order for John Paul Stephen',
    html: `<div>
          <h2>There's a new order</h2>
          <h2>These are the new order details</h2>
              ${cart.products.map((arr) => {
                return `<div>
      <img src=${arr.image} style="width:50%; height:50%;"></img>
      <p>Product name : ${arr.name}</p>
      <p>Size : ${arr.size}</p>
      <p>Quantity: ${arr.quantity}</p>
      <p>Price: ${arr.price}</p>
      <p>Subtotal: ${arr.total}</p>
      <div>
      </div>
      </div>`
              })}
              <p>Shipping cost: 4.99</p>
              <p>Total: ${total}</p>
              <img style="width:50%; height:50%;" src="https://res.cloudinary.com/quadri/image/upload/v1626724740/JOHN_PAUL_STEPHEN_2_LR_BLACK_rfiw11.png"></img>
              </div>`,
  }
  sgMail
    .send(msg)
    .then(() => {
      res.send('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
})
router.post('/check-out-as-guest', async (req, res) => {
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
          products: [
            {
              productId,
              quantity,
              image,
              name,
              size,
              color,
              price,
              total,
              stock,
            },
          ],
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
          products: [
            {
              productId,
              quantity,
              image,
              name,
              size,
              color,
              price,
              total,
              stock,
            },
          ],
        })

        return res.status(201).send(newCart)
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).send('Something went wrong')
  }
})

router.put('/edit-product-size/:userId/:productId', async (req, res) => {
  const { size } = req.body
  const { user } = req.params.userId

  try {
    let cart = await cartModel.findOne({ user })
    cartModel.updateOne(
      { 'products._id': req.params.productId },
      {
        $set: {
          'products.$.size': size,
        },
      },
      function (err, model) {
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
router.put('/edit-product-color/:userId/:productId', async (req, res) => {
  const { color } = req.body
  const { user } = req.params.userId

  try {
    let cart = await cartModel.findOne({ user })
    cartModel.updateOne(
      { 'products._id': req.params.productId },
      {
        $set: {
          'products.$.color': color,
        },
      },
      function (err, model) {
        if (err) {
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

router.delete('/delete-item/:productId', async (req, res) => {
  const { userId } = req.body
  const cart = await cartModel.findOne({ userId })
  previousTotalItems = cart.totalItems

  cartModel.findOneAndUpdate(
    { _id: cart._id },
    {
      $pull: { products: { _id: req.params.productId } },
      totalItems: previousTotalItems - 1,
    },
    false,
    function (err, data) {
      if (err) {
        console.log(err)
      } else {
        res.send(data)
      }
    },
  )
})

router.delete('/guest-cart-token-delete', async (req, res) => {
  const tokenToBeDeleted = await idsModel.findByIdAndDelete(req.body.token)
  const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
  if (tokenToBeDeleted || cartToBeDeleted) {
    res.send('Check Out Token And Cart Deleted')
  }
})

router.delete('user-cart-delete', async (req, res) => {
  const cartToBeDeleted = await cartModel.findByIdAndDelete(req.body._id)
  if (cartToBeDeleted) {
    res.send('Cart Deleted')
  } else {
    res.send("Cart Doesn't exist")
  }
})

module.exports = router