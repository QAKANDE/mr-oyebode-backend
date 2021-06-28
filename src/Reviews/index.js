const router = require("express").Router();
const reviewModel = require("./schema");
const productModel = require("../products/schema");
const accessoriesModel = require("../accessories/schema")


const objectId = require("mongodb").ObjectID;

const zeros = (i) => {
    if (i < 10) {
        return "0" + i;
    } else {
        return i;
    }
};

router.get("/", async(req, res) => {
    const reviews = await reviewModel.find();
    res.send(reviews);
});

router.get("/:productId", async(req, res) => {
    const allReview = await reviewModel.find();
    const findReview = allReview.filter(
        (review) => review.productId === req.params.productId
    );
    res.send(findReview);
});

router.post("/new-review/", async(req, res) => {
    try {
        const {
            productId,
            text,
            width,
            email,
            ratings
        } = req.body;
        const products = await productModel.findById(req.body.productId);
        const accessories = await accessoriesModel.findById(req.body.productId);
        if (products) {
            const productName = products.name;
            const productImage = products.image;
            const newReview = new reviewModel();
            newReview.productId = productId;
            newReview.name = productName;
            newReview.image = productImage;
            newReview.date = new Date().toDateString();
            newReview.time = zeros(
                zeros(new Date().getHours()) + ":" + zeros(new Date().getMinutes())
            );
            newReview.text = text;
            newReview.width = width;
            newReview.email = email;
            newReview.ratings = ratings;
            const reviewSaved = await newReview.save();
            res.send("Review Created");
        } else if (accessories) {
            const productName = accessories.name;
            const productImage = accessories.image;
            const newReview = new reviewModel();
            newReview.productId = productId;
            newReview.name = productName;
            newReview.image = productImage;
            newReview.date = new Date().toDateString();
            newReview.time = zeros(zeros(new Date().getHours()) + ":" + zeros(new Date().getMinutes()));
            newReview.text = text;
            newReview.width = width;
            newReview.email = email;
            newReview.ratings = ratings;
            const reviewSaved = await newReview.save();
            res.send("Review Created");
        }


    } catch (error) {
        console.log(error);
    }
});

router.delete("/delete-review/:productId", async(req, res) => {
    const deleteReview = await reviewModel.findByIdAndDelete(
        req.params.productId
    );
    res.send("Review Deleted");
});

module.exports = router;