const router = require("express").Router();
const stripe = require("stripe")(
    "sk_test_51HrjVqFcebO7I650cg7qAO3LQ8zMTuIbIrsmN4e7G6bF5De1LYaibXReF99xrERIFKNPPCJNERjPH5ARrOXsSTDw00lzJ53cGu"
);
const stripeModel = require("./schema");
const objectId = require("mongodb").ObjectID;
var mongoose = require("mongoose");

router.post("/create-product-price", async(req, res) => {
    const { productName, productPrice, productId, quantity, userId } = req.body;

    const product = await stripe.products.create({ name: productName });
    const price = await stripe.prices.create({
        unit_amount: productPrice,
        currency: "gbp",
        product: product.id,
    });

    const priceId = price.id;
    const existingStripe = await stripeModel.findOne({
        userId,
    });
    if (existingStripe) {
        let itemIndex = existingStripe.products.findIndex(
            (p) => p.productId === productId
        );
        if (itemIndex > -1) {
            let priceItem = existingStripe.products[itemIndex];
            priceItem.quantity = quantity;
            existingStripe.products[itemIndex] = priceItem;
        } else {
            existingStripe.products.push({
                productId,
                priceId,
                quantity,
            });
        }
        await existingStripe.save();
        return res.status(200).send("Created");
    } else {
        const newStripe = await stripeModel.create({
            userId,
            products: [{ productId, priceId, quantity }],
        });
        return res.status(200).send("Created");
    }
});
router.post("/create-checkout-session", async(req, res) => {
    try {
        const { userId } = req.body;
        const stripes = await stripeModel.findOne({ userId });
        const arr = [];
        for (let i = 0; i < stripes.products.length; i++) {
            let priceDetails = {
                price: stripes.products[i].priceId,
                quantity: stripes.products[i].quantity,
            };
            arr.push(priceDetails);
        }
        const session = await stripe.checkout.sessions.create({
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
            payment_method_types: ["card"],
            line_items: arr,
            mode: "payment",
        });

        res.json({ id: session.id });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;