const router = require("express").Router();
const productModel = require("./schema");
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

router.post("/newproduct", async(req, res) => {
    try {
        const newProduct = new productModel(req.body);
        await newProduct.save();

        res.json("Cretaed");
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