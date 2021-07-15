const router = require('express').Router()
const productModel = require('./schema')
const accessoryModel = require('../accessories/schema')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const configuration = require('../services/middlewares/cloudinary')
const { v4: uuidv4 } = require('uuid')
    // const storage = multer.diskStorage({
    //     filename: function(req, file, cb) {
    //         console.log(file);
    //         cb(null, file.originalname);
    //     },
    // });
const fileUpload = multer()

// configuration();

// CLOUDINARY_URL = process.env.CLOUDINARY_URL;
// cloudinary.config({
//     cloud_name: "quadri",
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
// });

router.get('/cookies', async(req, res) => {
    const id = uuidv4()
    cookieData = {
            token: id,
        }
        // res
        //     .cookie('token', JSON.stringify(cookieData), {
        //         httpOnly: false,
        //         maxAge: 1000 * 60 * 60 * 24 * 30 * 12 * 3000,
        //     })
        //     .send('succes')
    res
        .writeHead(200, {
            'Set-Cookie': `token=${id}`,
            'Access-Control-Allow-Credentials': 'true',
        })
        .send()
})

router.get('/', async(req, res) => {
    const products = await productModel.find()
    res.send(products)
})

router.get('/:id', async(req, res) => {
    const foundProduct = await productModel.findById(req.params.id)
    res.send(foundProduct)
})

router.get('/search/:productName', async(req, res) => {
    try {
        const allProducts = await productModel.find()
        const allAccessories = await accessoryModel.find()
        const filteredProduct = allProducts.filter(
            (product) => product.name === req.params.productName,
        )
        const filteredAccessory = allAccessories.filter(
            (accessory) => accessory.name === req.params.productName,
        )
        if (filteredProduct.length !== 0) {
            res.send(filteredProduct)
        } else if (filteredAccessory.length !== 0) {
            res.send(filteredAccessory)
        } else if (filteredAccessory.length === 0 && filteredProduct.length === 0) {
            res.json({
                message: 'Not Found',
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/newproduct', async(req, res) => {
    const {
        name,
        price,
        imageUrl,
        description,
        color,
        sizeAsString,
        size,
        productId,
        stockColor,
        stockSize,
        stockQuantity,
        stockId,
    } = req.body

    // const sizeArr = size.split('')

    // const colorSplit = color.split(',')
    try {
        let product = await productModel.findById(productId)
        if (product) {
            if (imageUrl !== undefined) {
                product.images.push({ imageUrl: imageUrl })
                product = await product.save()
                res.send('Image Added')
            } else {
                if (product.stock.length !== 0) {
                    product.stock.push({
                        colors: [{
                            color: stockColor,
                            sizes: [{
                                size: stockSize,
                                quantity: stockQuantity,
                            }, ],
                        }, ],
                    })
                    product = await product.save()
                    res.send('Updated')
                }
            }
        } else {
            const descriptionSplit = description.split(',')
            const newProduct = await productModel.create({
                name,
                price,
                colors: colorSplit,
                images: [{ imageUrl: imageUrl }],
                stock: [{
                    colors: [{
                        color: stockColor,
                        sizes: [{
                            size: stockSize,
                            quantity: stockQuantity,
                        }, ],
                    }, ],
                }, ],
                description: descriptionSplit,
                sizeAsString,
                sizes: sizeArr,
            })
            if (newProduct) {
                res.send(newProduct)
            } else {
                res.status(400).json({
                    message: 'Bad request',
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
})

router.post(
    '/product-image',
    fileUpload.single('productImage'),
    async(req, res) => {
        try {
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result)
                        } else {
                            reject(error)
                        }
                    })

                    streamifier.createReadStream(req.file.buffer).pipe(stream)
                })
            }

            async function upload(req) {
                let result = await streamUpload(req)
                res.send(result.url)
            }

            upload(req)
        } catch (error) {
            console.log(error)
        }
    },
)

router.put('/edit-product/:id', async(req, res) => {
    const { name, price, image, description, color, size } = req.body
    const edit = await productModel.findByIdAndUpdate(req.params.id, {
        name: name,
        price: price,
        image: image,
        description: description,
        color: color,
        size: size,
    })
    if (edit) {
        res.send('Product Edited ')
    } else {
        console.log('Something wromg')
    }
})
router.put('/update-stock-quantity', async(req, res) => {
    const { stockId, productId } = req.body
    try {
        console.log(productId)
        let product = await productModel.findById(productId)

        // const stockItem = product.stock.filter((stck) => stck._id === stockId)
        // console.log(stockItem)
        // let cart = await cartModel.findOne({ user })

        // cartModel.updateOne({ 'products.productId': req.params.productId }, {
        //         $set: {
        //             'products.$.size': size,
        //         },
        //     },
        //     function(err, model) {
        //         if (err) {
        //             console.log(err)
        //             return res.send(err)
        //         } else {
        //             return res.json(model)
        //         }
        //     },
        // )
    } catch (error) {
        console.log(error)
    }
})

router.delete('/:id', async(req, res) => {
    const productToBeDeleted = await productModel.findByIdAndDelete(req.params.id)
    res.send('Deleted')
})

module.exports = router