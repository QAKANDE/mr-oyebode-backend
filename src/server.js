const express = require('express')
const mongoose = require('mongoose')
const session = require('cookie-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const newCart = require('./cart/index')
const products = require('./products/index')
const users = require('./users/index')
const admin = require('./admin/index')
const review = require('./Reviews/index')
const payment = require('./payment/index')
const order = require('./orders/index')
const wishList = require('./Wishlist/index')
const accessories = require('./accessories/index')

const server = express()

const port = process.env.PORT || 3003

// server.use(bodyParser.urlencoded({ extended: false }))
// server.use(bodyParser.json())
server.use(cors())
server.use(express.urlencoded({ extended: false }))
server.use(express.json())
server.use(cookieParser())
    // server.set('trust proxy', 1)
server.use(
    session({
        name: 'session',
        secret: process.env.SESSION_SECRET_KEY,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        // saveUninitialized: true,
        // resave: false,
        // cookie: {
        //     httpOnly: true,
        //     maxAge: parseInt(process.env.SESSION_MAX_AGE),
        //     sameSite: true,
        // },
    }),
)
server.use((req, res, next) => {
    next()
})

server.use('/cart', newCart)
server.use('/product', products)
server.use('/users', users)
server.use('/admin', admin)
server.use('/reviews', review)
server.use('/payment', payment)
server.use('/orders', order)
server.use('/wishlist', wishList)
server.use('/accessories', accessories)
server.disable('x-powered-by')

mongoose
    .connect('mongodb://localhost:27017/mr-akintunde-e-commerce', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(
        server.listen(port, () => {
            console.log('Server is running on port', port)
        }),
    )
    .catch((err) => console.log(err))