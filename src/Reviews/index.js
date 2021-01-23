const router = require("express").Router();
const reviewModel = require("./schema");
const productModel = require("../products/schema");
const objectId = require("mongodb").ObjectID;

router.get("/", async(req, res) => {
    const reviews = await reviewModel.find();
    res.send(reviews);
});

router.get("/:name", async(req, res) => {
    const { productId } = req.params.productId;
    const allReview = await reviewModel.find();
    const re = await reviewModel.findOne({ productId });
    const findReview = allReview.filter(
        (review) => review.name === req.params.name
    );
    res.send(findReview);
});

router.post("/new-review/", async(req, res) => {
    try {
        const products = await productModel.findById(req.body.productId);
        const productName = products.name;
        const productImage = products.image;
        const newReview = new reviewModel();
        newReview.productId = req.body.productId;
        newReview.name = productName;
        newReview.image = productImage;
        newReview.date = new Date().toDateString();
        newReview.time = new Date().getHours() + ":" + new Date().getMinutes();
        newReview.text = req.body.text;
        newReview.email = req.body.email;
        newReview.ratings = req.body.ratings;
        const reviewSaved = await newReview.save();
        res.send("Review Created");
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