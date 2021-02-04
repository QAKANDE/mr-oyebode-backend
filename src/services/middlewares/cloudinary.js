const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

CLOUDINARY_URL = process.env.CLOUDINARY_URL;

const configuration = cloudinary.config({
    cloud_name: "quadri",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadImage = async(req) => {
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
            return { result };
        }
        upload(req);
    } catch (error) {
        console.log(error);
    }
};

module.exports = { uploadImage };