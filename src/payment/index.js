const router = require('express').Router()
const stripe = require('stripe')(
    'sk_test_51HrjVqFcebO7I650cg7qAO3LQ8zMTuIbIrsmN4e7G6bF5De1LYaibXReF99xrERIFKNPPCJNERjPH5ARrOXsSTDw00lzJ53cGu',
)
const fetch = require('node-fetch')
const stripeModel = require('./schema')
const objectId = require('mongodb').ObjectID
const cartModel = require('../cart/schema')
const guestModel = require('../cart/idModel')
var mongoose = require('mongoose')

router.post('/send-royal-mail-order', async(req, res) => {
    try {
        const {
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

        const response = await fetch(
            'https://api.parcel.royalmail.com/api/v1/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: [{
                        recipient: {
                            address: {
                                fullName: fullName,
                                addressLine1: addressLine1,
                                city: city,
                                postcode: postCode,
                                CountryCode: 'GB',
                            },
                            emailAddress: email,
                        },
                        sender: {
                            tradingName: 'John Paul Stephen Limited',
                            phoneNumber: '07515030849',
                            emailAddress: 'akintunde.oyebode@johnpaulstephen.com',
                        },
                        billing: {
                            address: {
                                fullName: billingAddressFullName,
                                addressLine1: billingAddressaddressLine1,
                                city: billingAddresscity,
                                postcode: billingAddresspostCode,
                                CountryCode: 'GB',
                            },
                            emailAddress: billingAddressemail,
                        },
                        orderDate: new Date(),
                        subtotal: subTotal,
                        shippingCostCharged: 4.99,
                        total: total,
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
        res.send(details)
    } catch (error) {
        console.log(error)
    }
})

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

// router.post('/create-product-price', async(req, res) => {
//     const { productName, productPrice, productId, quantity, userId } = req.body

//     const product = await stripe.products.create({ name: productName })
//     const price = await stripe.prices.create({
//         unit_amount: productPrice,
//         currency: 'gbp',
//         product: product.id,
//     })

//     const priceId = price.id
//     const existingStripe = await stripeModel.findOne({
//         userId,
//     })
//     if (existingStripe) {
//         let itemIndex = existingStripe.products.findIndex(
//             (p) => p.productId === productId,
//         )
//         if (itemIndex > -1) {
//             let priceItem = existingStripe.products[itemIndex]
//             priceItem.quantity = quantity
//             existingStripe.products[itemIndex] = priceItem
//         } else {
//             existingStripe.products.push({
//                 productId,
//                 priceId,
//                 quantity,
//             })
//         }
//         await existingStripe.save()
//         return res.status(200).send('Created')
//     } else {
//         const newStripe = await stripeModel.create({
//             userId,
//             products: [{ productId, priceId, quantity }],
//         })
//         return res.status(200).send('Created')
//     }
// })
// router.post('/create-checkout-session', async(req, res) => {
//     try {
//         const { userId } = req.body
//         const stripes = await stripeModel.findOne({ userId })
//         const arr = []
//         for (let i = 0; i < stripes.products.length; i++) {
//             let priceDetails = {
//                 price: stripes.products[i].priceId,
//                 quantity: stripes.products[i].quantity,
//             }
//             arr.push(priceDetails)
//         }
//         const session = await stripe.checkout.sessions.create({
//             success_url: 'http://localhost:3000/paymentsuccessful',
//             cancel_url: 'https://example.com/cancel',
//             payment_method_types: ['card'],
//             line_items: arr,
//             mode: 'payment',
//         })

//         res.json({ id: session.id })
//     } catch (error) {
//         console.log(error)
//     }
// })

router.delete('/delete-payment-price-and-cart', async(req, res) => {
    try {
        const { userId } = req.body
        const stripePrices = await stripeModel.findOne({ userId })
        const cart = await cartModel.findOne({ userId })
        const deleteStripe = await stripeModel.findByIdAndDelete(stripePrices._id)
        const deleteCart = await cartModel.findByIdAndDelete(cart._id)
        const deleteGuestToken = await guestModel.findByIdAndDelete(userId)
        res.send('Deleted')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router