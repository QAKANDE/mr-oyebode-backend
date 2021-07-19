const router = require('express').Router()
const productModel = require('./schema')
const accessoryModel = require('../accessories/schema')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const configuration = require('../services/middlewares/cloudinary')
const { v4: uuidv4 } = require('uuid')

const fileUpload = multer()

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
        imageUrl,
        description,
        productId,
        stockColor,
        stockSize,
        stockQuantity,
        stockId,
    } = req.body
    try {
        let product = await productModel.findById(productId)
        if (product) {
            if (imageUrl !== undefined) {
                product.imageUrl.push({ url: imageUrl })
                product = await product.save()
                res.send('image edited')
            }
            if (stockColor !== undefined) {
                product.stock.push({
                    color: stockColor,
                    sizes: [{ size: stockSize, quantity: stockQuantity }],
                })
                product = await product.save()
                res.send('Updated')
            }
            if (stockColor === undefined && imageUrl === undefined) {
                const query = { _id: productId, 'stock._id': stockId }
                const updateDocument = {
                    $push: {
                        'stock.$.sizes': { size: stockSize, quantity: stockQuantity },
                    },
                }
                const result = await productModel.updateOne(query, updateDocument)
                res.json({ message: 'Updated' })
            }
        } else {
            const stock = {
                color: stockColor,
                size: stockSize,
                quantity: stockQuantity,
            }
            const descriptionSplit = description.split(',')
            const newProduct = await productModel.create({
                name,
                imageUrl: [{ url: imageUrl }],
                stock: [{
                    color: stockColor,
                    sizes: [{ size: stockSize, quantity: stockQuantity }],
                }, ],
                description: descriptionSplit,
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
router.post('/update-color-size', async(req, res) => {
    try {
        const arr = []
        const { productId, stockId } = req.body
        let product = await productModel.findById(productId)
        const stockItem = product.stock.map((stck) => {
            return arr.push(stck)
        })
        const filt = arr.filter((stck) => stck._id === stockId)
        res.send(arr)
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
    const { productId, sizeId, quantity, stockId, size } = req.body
    const stringifiedQuantity = quantity.toString()

    try {
        let product = await productModel.findById(productId)
        const query = {
            _id: productId,
            'stock._id': stockId,
        }
        const updateDocument = {
            $set: { 'stock.$.sizes': { quantity } },
        }

        const filters = [{ 'sizes._id': sizeId }]

        const result = await productModel.updateOne(filters, query, updateDocument)

        res.json({ message: result })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/:id', async(req, res) => {
    const productToBeDeleted = await productModel.findByIdAndDelete(req.params.id)
    res.send('Deleted')
})

module.exports = router