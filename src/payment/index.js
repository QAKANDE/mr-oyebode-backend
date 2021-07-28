const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const fetch = require('node-fetch')
const orderAddressModel = require('./schema')
const objectId = require('mongodb').ObjectID
const cartModel = require('../cart/schema')
const guestModel = require('../cart/idModel')
var mongoose = require('mongoose')
var request = require('request')
const stripeModel = require('./StripeSchema')
var PAYPAL_API = 'https://api-m.sandbox.paypal.com/'

router.post('/order-address', async(req, res) => {
    const {
        userId,
        fullName,
        addressLine1,
        city,
        postCode,
        email,
        subTotal,
        total,
        billingAddressFullName,
        billingAddressaddressLine1,
        billingAddresscity,
        billingAddresspostCode,
        billingAddressemail,
    } = req.body

    const newOrderAddress = await orderAddressModel.create({
        userId: userId,
        fullName: fullName,
        addressLine1: addressLine1,
        city: city,
        postCode: postCode,
        email: email,
        subTotal: subTotal,
        total: total,
        billingAddressFullName: billingAddressFullName,
        billingAddressaddressLine1: billingAddressaddressLine1,
        billingAddresscity: billingAddresscity,
        billingAddresspostCode: billingAddresspostCode,
        billingAddressemail: billingAddressemail,
    })

    if (newOrderAddress) {
        res.json({
            message: 'Success',
        })
    }
})

router.post('/send-royal-mail-order', async(req, res) => {
    try {
        const { id } = req.body
        const userId = id
        const findAddress = await orderAddressModel.findOne({ userId })
        const findCart = await cartModel.findOne({ userId })

        const response = await fetch(
            'https://api.parcel.royalmail.com/api/v1/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: [{
                        recipient: {
                            address: {
                                fullName: findAddress.fullName,
                                addressLine1: findAddress.addressLine1,
                                city: findAddress.city,
                                postcode: findAddress.postCode,
                                CountryCode: 'GB',
                            },
                            emailAddress: findAddress.email,
                        },
                        sender: {
                            tradingName: 'John Paul Stephen Limited',
                            phoneNumber: '07515030849',
                            emailAddress: 'akintunde.oyebode@johnpaulstephen.com',
                        },
                        billing: {
                            address: {
                                fullName: findAddress.billingAddressFullName,
                                addressLine1: findAddress.billingAddressaddressLine1,
                                city: findAddress.billingAddresscity,
                                postcode: findAddress.billingAddresspostCode,
                                CountryCode: 'GB',
                            },
                            emailAddress: findAddress.billingAddressemail,
                        },
                        orderDate: new Date(),
                        subtotal: findAddress.subTotal,
                        shippingCostCharged: 4.99,
                        total: findAddress.total,
                        currencyCode: 'GBP',
                        postageDetails: {
                            sendNotificationsTo: 'sender',
                            receiveEmailNotification: true,
                        },
                        label: {
                            includeLabelInResponse: true,
                        },
                    }, ],
                }),
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${process.env.royal_mail_key}`,
                },
            },
        )
        const details = await response.json()

        res.json({
            details: details,
            cartId: findCart._id,
            custEmail: findAddress.email,
            orderId: findAddress._id,
        })
    } catch (error) {
        console.log(error)
    }
})

// router.post('/my-api/create-payment/', function(req, res) {
//         const { total } = req.body

//         request.post(
//             PAYPAL_API + '/v1/payments/payment', {
//                 auth: {
//                     user: process.env.PAYPAL_CLIENT_ID,
//                     pass: process.env.PAYPAL_SECRET_KEY,
//                 },
//                 body: {
//                     intent: 'sale',
//                     payer: {
//                         payment_method: 'paypal',
//                     },
//                     transactions: [{
//                         amount: {
//                             total: total,
//                             currency: 'GBP',
//                         },
//                     }, ],
//                     redirect_urls: {
//                         return_url: 'www.johnpaulstephen.com/order-confirmed',
//                         cancel_url: 'www.johnpaulstephen.com/order-confirmed',
//                     },
//                 },
//                 json: true,
//             },
//             function(err, response) {
//                 if (err) {
//                     console.error(err)
//                     return res.sendStatus(500)
//                 } else {
//                     res.json({
//                         id: response.body.id,
//                     })
//                 }
//             },
//         )
//     })
// router.post('/my-api/execute-payment/', function(req, res) {
//     // 2. Get the payment ID and the payer ID from the request body.
//     var paymentID = req.body.paymentID
//     var payerID = req.body.payerID
//     const total = req.body.total
//         // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
//     request.post(
//         PAYPAL_API + '/v1/payments/payment/' + paymentID + '/execute', {
//             auth: {
//                 user: process.env.PAYPAL_CLIENT_ID,
//                 pass: process.env.PAYPAL_SECRET_KEY,
//             },
//             body: {
//                 payer_id: payerID,
//                 transactions: [{
//                     amount: {
//                         total: total,
//                         currency: 'GBP',
//                     },
//                 }, ],
//             },
//             json: true,
//         },
//         function(err, response) {
//             if (err) {
//                 console.error(err)
//                 return res.sendStatus(500)
//             }
//             // 4. Return a success response to the client
//             res.json({
//                 status: 'success',
//             })
//         },
//     )
// })

// router.post('/checkout', async function(req, res) {
//     function getAmzDate(dateStr) {
//         var chars = [':', '-']
//         for (var i = 0; i < chars.length; i++) {
//             while (dateStr.indexOf(chars[i]) != -1) {
//                 dateStr = dateStr.replace(chars[i], '')
//             }
//         }
//         dateStr = dateStr.split('.')[0] + 'Z'
//         return dateStr
//     }
//     var amzDate = getAmzDate(new Date().toISOString())
//     var authDate = amzDate.split('T')[0]
//     var payload = ''
//     var hashedPayload = crypto.SHA256(payload).toString()
//     var access_key =
//         '6f0f4626bb8659d6b35148aaec3a25883d8070ba10673f6bf69c259c2b6acfe39c8217e7c74c6f3616ae74d90c0f4a8f'
//     var secret_key =
//         '6f0f4626bb8659d6b35148aaec3a25883d8070ba10673f6bf69c259c2b6acfe39c8217e7c74c6f3616ae74d90c0f7a9g'
//     var region = 'eu-west-2'
//     var url = 'qoabucket.s3.amazonaws.com'
//     var myService = 's3'
//     var myMethod = 'GET'
//     var myPath = '/'
//     var canonicalReq =
//         myMethod +
//         '\n' +
//         myPath +
//         '\n' +
//         '\n' +
//         'host:' +
//         url +
//         '\n' +
//         'x-amz-content-sha256:' +
//         hashedPayload +
//         '\n' +
//         'x-amz-date:' +
//         amzDate +
//         '\n' +
//         '\n' +
//         'host;x-amz-content-sha256;x-amz-date' +
//         '\n' +
//         hashedPayload
//     var canonicalReqHash = crypto.SHA256(canonicalReq).toString()
//     var stringToSign =
//         'AWS4-HMAC-SHA256\n' +
//         amzDate +
//         '\n' +
//         authDate +
//         '/' +
//         region +
//         '/' +
//         myService +
//         '/aws4_request\n' +
//         canonicalReqHash

//     function getSignatureKey(Crypto, key, dateStamp, regionName, serviceName) {
//         var kDate = Crypto.HmacSHA256(dateStamp, 'AWS4' + key)
//         var kRegion = Crypto.HmacSHA256(regionName, kDate)
//         var kService = Crypto.HmacSHA256(serviceName, kRegion)
//         var kSigning = Crypto.HmacSHA256('aws4_request', kService)
//         return kSigning
//     }

//     const secondHash = (Crypto, one, two) => {
//         return Crypto.HmacSHA256(one, two)
//     }
//     var signingKey = getSignatureKey(
//         crypto,
//         secret_key,
//         authDate,
//         region,
//         myService,
//     )
//     const authKey = secondHash(crypto, stringToSign, signingKey)
//     var authString =
//         'AWS4-HMAC-SHA256 ' +
//         'Credential=' +
//         access_key +
//         '/' +
//         authDate +
//         '/' +
//         region +
//         '/' +
//         myService +
//         '/aws4_request,' +
//         'SignedHeaders=host;x-amz-content-sha256;x-amz-date,' +
//         'Signature=' +
//         authKey

//     const response = await fetch(
//         'https://pay-api.amazon.eu/v2/checkoutSessions', {
//             method: 'POST',
//             body: JSON.stringify({
//                 webCheckoutDetails: {
//                     checkoutReviewReturnUrl: 'http://localhost:3003/payment/success',
//                 },
//                 storeId: 'amzn1.application-oa2-client.b2f0eee6e7844ea48e72e4f3986de8dd',
//                 scopes: ['name', 'email', 'phoneNumber', 'billingAddress'],
//             }),
//             headers: {
//                 Authorization: authString,
//                 'x-amz-date': amzDate,
//                 'Content-Type': 'application/json',
//                 'x-amz-pay-idempotency-key': '8917f92e-6c50-4f69-ade7-1aac0f5b9555',
//                 'x-amz-content-sha256': hashedPayload,
//             },
//         },
//     )
//     const details = await response.json()
//     console.log(details)
// })

router.post('/create-product-price', async(req, res) => {
    const { productName, productPrice, productId, quantity, userId } = req.body

    const product = await stripe.products.create({ name: productName })
    const price = await stripe.prices.create({
        unit_amount: productPrice,
        currency: 'gbp',
        product: product.id,
    })

    const priceId = price.id
    const existingStripe = await stripeModel.findOne({
        userId,
    })
    if (existingStripe) {
        let itemIndex = existingStripe.products.findIndex(
            (p) => p.productId === productId,
        )
        if (itemIndex > -1) {
            let priceItem = existingStripe.products[itemIndex]
            priceItem.quantity = quantity
            existingStripe.products[itemIndex] = priceItem
        } else {
            existingStripe.products.push({
                productId,
                priceId,
                quantity,
            })
        }
        await existingStripe.save()

        return res.status(200).send('Created')
    } else {
        const newStripe = await stripeModel.create({
            userId,
            products: [{ productId, priceId, quantity }],
        })
        return res.status(200).send('Created')
    }
})
router.post('/create-checkout-session', async(req, res) => {
    try {
        const { userId } = req.body
        const stripes = await stripeModel.findOne({ userId })

        const arr = []
        stripes.products.map((str) => {
            return arr.push({ price: str.priceId, quantity: str.quantity })
        })

        const session = await stripe.checkout.sessions.create({
            success_url: 'https://www.johnpaulstephen.com/order-confirmed',
            cancel_url: 'https://www.johnpaulstephen.com/cart',
            shipping_rates: [process.env.STRIPE_SHIPPING_KEY],
            shipping_address_collection: {
                allowed_countries: ['GB'],
            },
            payment_method_types: ['card'],
            line_items: arr,
            mode: 'payment',
        })

        res.json({
            url: session.url,
        })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/delete-stripe-price', async(req, res) => {
    try {
        const { userId, productId } = req.body
        const stripePrices = await stripeModel.findOne({ userId })

        const test = stripeModel.findOneAndUpdate({ _id: stripePrices._id }, {
                $pull: { products: { productId: productId } },
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
    } catch (error) {
        console.log(error)
    }
})

module.exports = router