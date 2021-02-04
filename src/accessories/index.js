const router = require("express").Router();
const accessoriesModel = require("./schema");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
// const configuration = require("../services/middlewares/cloudinary");
const { uploadImage } = require("../services/middlewares/cloudinary");

const fileUpload = multer();
cloudinary.config({
    cloud_name: "quadri",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

router.get("/", async(req, res) => {
    const accessories = await accessoriesModel.find();
    res.send(accessories);
});
router.get("/:id", async(req, res) => {
    const foundAccessory = await accessoriesModel.findById(req.params.id);
    res.send(foundAccessory);
});

router.post("/newproduct", async(req, res) => {
    try {
        const { name, price, image, description, color, size } = req.body;
        const newAccessory = new accessoriesModel();
        newAccessory.name = name;
        newAccessory.price = price;
        newAccessory.image = image;
        newAccessory.description = description;
        newAccessory.color = color;
        newAccessory.size = size;
        await newAccessory.save();
        res.json(newAccessory._id);
    } catch (error) {
        res.status(400).send("Bad Request");
        console.log(error);
    }
});
router.post(
    "/accessories-image",
    fileUpload.single("accessoriesImage"),
    async(req, res) => {
        try {
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            console.log(error);
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
router.put("/edit-accessory/:id", async(req, res) => {
    const { name, price, image, description, color, size } = req.body;
    const edit = await accessoriesModel.findByIdAndUpdate(req.params.id, {
        name: name,
        price: price,
        image: image,
        description: description,
        color: color,
        size: size,
    });
    if (edit) {
        res.send("Accessory Edited");
    } else {
        res.status(400).send("Bad Request");
    }
});

router.delete("/:id", async(req, res) => {
    const accessoryToBeDeleted = await accessoriesModel.findByIdAndDelete(
        req.params.id
    );
    res.send("Deleted");
});

module.exports = router;