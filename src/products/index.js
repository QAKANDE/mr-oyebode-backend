const router = require("express").Router();
const productModel = require("./schema");
const accessoryModel = require("../accessories/schema");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const configuration = require("../services/middlewares/cloudinary");
// const storage = multer.diskStorage({
//     filename: function(req, file, cb) {
//         console.log(file);
//         cb(null, file.originalname);
//     },
// });
const fileUpload = multer();

// configuration();

// CLOUDINARY_URL = process.env.CLOUDINARY_URL;
// cloudinary.config({
//     cloud_name: "quadri",
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
// });

router.get("/", async(req, res) => {
    const products = await productModel.find();
    res.send(products);
});

router.get("/:id", async(req, res) => {
    const foundProduct = await productModel.findById(req.params.id);
    res.send(foundProduct);
});

router.get("/search/:productName", async(req, res) => {
    try {
        const allProducts = await productModel.find();
        const allAccessories = await accessoryModel.find();
        const filteredProduct = allProducts.filter(
            (product) => product.name === req.params.productName
        );
        const filteredAccessory = allAccessories.filter(
            (accessory) => accessory.name === req.params.productName
        );
        if (filteredProduct.length !== 0) {
            res.send(filteredProduct);
        } else if (filteredAccessory.length !== 0) {
            res.send(filteredAccessory);
        } else if (filteredAccessory.length === 0 && filteredProduct.length === 0) {
            res.json({
                message: "Not Found",
            });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/newproduct", async(req, res) => {
    const { name, price, image, description, color, sizeAsString, size } = req.body;
    const sizeArr = size.split("")
    try {

        const newProduct = await productModel.create({
            name,
            price,
            image,
            description,
            color,
            sizeAsString,
            sizes: sizeArr
        });
        if (newProduct) {
            res.send(newProduct)

        } else {
            res.status(400).json({
                message: "Bad request"
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.post(
    "/product-image",
    fileUpload.single("productImage"),
    async(req, res) => {
        try {
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });

                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            async function upload(req) {
                let result = await streamUpload(req);
                res.send(result.url);
            }

            upload(req);
        } catch (error) {
            console.log(error);
        }
    }
);

router.put("/edit-product/:id", async(req, res) => {
    const { name, price, image, description, color, size } = req.body;
    const edit = await productModel.findByIdAndUpdate(req.params.id, {
        name: name,
        price: price,
        image: image,
        description: description,
        color: color,
        size: size,
    });
    if (edit) {
        console.log("edited");
        res.send("Product Edited ");
    } else {
        console.log("Something wromg");
    }
});

router.delete("/:id", async(req, res) => {
    const productToBeDeleted = await productModel.findByIdAndDelete(
        req.params.id
    );
    res.send("Deleted");
});

module.exports = router;