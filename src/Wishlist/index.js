const express = require("express");
const router = express.Router();
const wishListModel = require("./schema");

router.get("/:userId", async(req, res) => {
    try {
        const { userId } = req.params.userId;
        const wishListPerUser = await wishListModel.findOne({ userId });
        if (wishListPerUser) {
            res.send(wishListPerUser);
        } else {
            res.json({
                message: "No item in wishlist",
            });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/:userId", async(req, res) => {
    try {
        const { userId } = req.params.userId;
        const { productId, image, name, size, color, price } = req.body;
        const wishList = await wishListModel.findOne({ userId });
        if (wishList) {
            let itemIndex = wishList.products.findIndex(
                (p) => p.productId == productId
            );
            if (itemIndex > -1) {
                res.json({
                    message: "Item already in wishlist",
                });
            } else {
                wishList.products.push({
                    productId,
                    image,
                    name,
                    size,
                    color,
                    price,
                });
            }
            await wishList.save();
        } else {
            const newWishList = await wishListModel.create({
                userId,
                products: [{ productId, image, name, size, color, price }],
            });

            return res.status(201).send(newWishList);
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;