const router = require("express").Router();
const reviewModel = require("./schema");
const productModel = require("../products/schema");
const objectId = require("mongodb").ObjectID;

router.get("/:productId", async(req, res) => {
    const { productId } = req.params.productId;
    const allReview = await reviewModel.find();
    const re = await reviewModel.findOne({ productId });
    const findReview = allReview.filter(
        (review) => review.productId === req.params.productId
    );
    res.send(findReview);
});

router.post("/new-review/:productId", async(req, res) => {
    const newReview = new reviewModel();
    newReview.productId = req.params.productId;
    newReview.name = req.body.name;
    newReview.date = new Date().toDateString();
    newReview.time = new Date().getHours() + ":" + new Date().getMinutes();
    newReview.text = req.body.text;
    newReview.email = req.body.email;
    newReview.ratings = req.body.ratings;
    const reviewSaved = await newReview.save();
    res.send("Review Created");
});

router.delete("/delete-review/:productId", async(req, res) => {
    const deleteReview = await reviewModel.findByIdAndDelete(
        req.params.productId
    );
    res.send("Review Deleted");
});

module.exports = router;