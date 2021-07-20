const express = require('express')
const router = express.Router()
const profileModel = require('../users/schema')
const addressModel = require('../users/addressSchema')
const objectId = require('mongodb').ObjectID
const cartModel = require('../cart/schema')
const bcrypt = require('bcryptjs')

const resetPasswordTokenModel = require('./resetPasswordSchema')
const userOrderModel = require('./ordersSchema')
const {
    authenticate,
    refreshToken,
    generateToken,
} = require('../users/authTools')
const { authorize } = require('../services/middlewares/authorize')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

router.get('/', async(req, res, next) => {
    try {
        const users = await profileModel.find()
        res.status(201).send(users)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async(req, res) => {
    try {
        const user = await profileModel.findById(req.params.id)
        res.send(user)
    } catch (error) {
        console.log(error)
    }
})

router.get('/user-order/:id', async(req, res) => {
    try {
        const { userId } = req.params.id
        const order = await userOrderModel.findOne({ userId })

        if (!order) {
            res.json({
                message: 'No Order Available',
            })
            console.log('No order')
        } else {
            res.send(order)
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/user-address/:userId', async(req, res) => {
    try {
        const address = await addressModel.findById(req.params.userId)
        if (!address) {
            res.json({
                message: 'Please Update Your Address',
            })
        } else {
            res.send(address)
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/user-order/:userId', async(req, res) => {
    try {
        cartArr = []
        const { id } = req.params.userId
        const cartPerUser = await cartModel.findOne({ id })

        if (!cartPerUser) {
            res.send("No item in user's cart")
        } else {
            for (let i = 0; i < cartPerUser.products.length; i++) {
                cartDetails = {
                    productId: cartPerUser.products[i].productId,
                    quantity: cartPerUser.products[i].quantity,
                    name: cartPerUser.products[i].name,
                    price: cartPerUser.products[i].price,
                    size: cartPerUser.products[i].size,
                    color: cartPerUser.products[i].color,
                    image: cartPerUser.products[i].image,
                    total: cartPerUser.products[i].total,
                    date: new Date().toDateString(),
                    time: new Date().getHours() + ':' + new Date().getMinutes(),
                }
                cartArr.push(cartDetails)
            }
            const newOrder = await userOrderModel.create({
                userId: req.params.userId,
                products: cartArr,
            })
            res.send('User Order added')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', async(req, res, next) => {
    try {
        const newUser = new profileModel(req.body)
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        console.log(error)
    }
})

router.post('/guest-token-already-exists/:guestToken', async(req, res) => {
    try {
        const { userName, email, phoneNumber, password } = req.body

        const newUser = new profileModel()
        newUser._id = objectId(req.params.guestToken)
        newUser.userName = userName
        newUser.email = email
        newUser.phoneNumber = phoneNumber
        newUser.password = password
        const userSentToApi = await newUser.save()
        res.status(201).send(userSentToApi)
    } catch (error) {
        res.status(400).send('Bad Request')
        console.log(error)
    }
})

router.post('/user-address/:userId', async(req, res) => {
    try {
        const { addressLine1, addressLine2, country, county, postCode } = req.body
        const address = await addressModel()
        address._id = objectId(req.params.userId)
        address.addressLine1 = addressLine1
        address.addressLine2 = addressLine2
        address.country = country
        address.county = county
        address.postCode = postCode
        const newAdress = await address.save()
        res.send('Address Added')
    } catch (error) {
        console.log(error)
    }
})

router.post('/login', async(req, res, next) => {
    const { email, password } = req.body

    try {
        const user = await profileModel.findByCredentials(email, password)
        const tokens = await generateToken(user)
        if (tokens) {
            res.setHeader('Content-Type', 'application/json')
            res.send(tokens)
        } else {
            console.log('Error from token')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/reset-password/:token/:email', async(req, res) => {
    try {
        const { password } = req.body

        const resetTokens = await resetPasswordTokenModel.find()
        const foundUserToken = resetTokens.filter(
            (token) => token.email === req.params.email,
        )

        if (foundUserToken.length !== 0) {
            if (foundUserToken[0].token === req.params.token) {
                const users = await profileModel.find()
                const filteredUser = users.filter(
                    (user) => user.email === req.params.email,
                )
                const newPassword = await bcrypt.hash(password, 8)
                const foundUserId = await profileModel.findByIdAndUpdate(
                    filteredUser[0]._id, {
                        password: newPassword,
                    },
                )

                if (foundUserId) {
                    res.json({
                        message: 'Password updated',
                    })
                } else {
                    res.json({
                        message: 'An error occured',
                    })
                }
            } else if (!foundUserToken) {
                res.json({
                    message: 'Invalid token',
                })
            }
        } else {
            res.json({
                message: 'User Not Found',
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/send-reset-password-to-email/:email', async(req, res) => {
    try {
        shortId.configure({
            length: 24,
            algorithm: 'sha1',
        })
        const token = shortId.generate()
        const users = await profileModel.find()
        const filteredUser = users.filter((user) => user.email === req.params.email)
        if (filteredUser.length !== 0) {
            const msg = {
                to: req.params.email, // Change to your recipient
                from: 'u1945140@uel.ac.uk', // Change to your verified sender
                subject: 'Reset Password',
                text: `Hello ${filteredUser[0].userName} , here's your access token ${filteredUser[0].userName}`,
                html: `
                <strong>Hello ${filteredUser[0].userName} , reset your password <a clicktracking=off  href="http://localhost:3000/updatePassword/${token}/${filteredUser[0].email}"> here</a>
                </strong>
                <div>
                 <img src = "https://res.cloudinary.com/quadri/image/upload/v1612584676/logo_trademark_prz1fd.png" width = "50%" / > 
                </div>`,
            }
            sgMail
                .send(msg)
                .then(async() => {
                    const resetPasswordToken = await new resetPasswordTokenModel()
                    resetPasswordToken.email = filteredUser[0].email
                    resetPasswordToken.token = token
                    await resetPasswordToken.save()
                    res.json({ message: 'Email sent successfully' })
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            res.json({
                message: 'User does not exist',
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/authorizeuser/:email', authorize, async(req, res, next) => {
    console.log(req.params.email)
    try {
        const user = await profileModel.find()
        const filteredUser = user.filter((user) => user.email === req.params.email)
        if (filteredUser.length === 0) {
            console.log('eRROR FROM EMAIL GET')
            console.log('email', req.params.email)
            console.log('the type', typeof req.params.email)
        } else {
            res.send(filteredUser[0])
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/delete-reset-token/:email', async(req, res) => {
    try {
        const resetTokens = await resetPasswordTokenModel.find()
        const foundUserToken = resetTokens.filter(
            (token) => token.email === req.params.email,
        )
        const deleteToken = await resetPasswordTokenModel.findByIdAndDelete(
            foundUserToken[0]._id,
        )
        if (deleteToken) {
            res.json({
                message: 'Deleted',
            })
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router