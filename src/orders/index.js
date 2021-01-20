const router = require("express").Router();
const orderModel = require("./schema");
const cartModel = require("../cart/schema");

router.get("/orders", async(req, res) => {
    try {
        const allOrders = await orderModel.find();
        res.send(allOrders);
    } catch (error) {
        console.log(error);
    }
});

router.post("/new-order", async(req, res) => {
    const cartArr = [];
    const {
        customerId,
        customerName,
        addressLine1,
        addressLine2,
        county,
        country,
        postCode,
        subTotal,
        userId,
    } = req.body;
    const cartPerUser = await cartModel.findOne({ userId });
    if (!cartPerUser) {
        res.send("No item in user's cart");
    } else {
        for (let i = 0; i < cartPerUser.products.length; i++) {
            cartDetails = {
                productId: cartPerUser.products[i].productId,
                quantity: cartPerUser.products[i].quantity,
                name: cartPerUser.products[i].name,
                price: cartPerUser.products[i].price,
                size: cartPerUser.products[i].size,
                color: cartPerUser.products[i].color,
                image: cartPerUser.products[i].image,
                total: cartPerUser.products[i].total,
            };
            cartArr.push(cartDetails);
        }
        const newOrder = await orderModel.create({
            customerId,
            customerName,
            deliveryAddress: {
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                county: county,
                country: country,
                postCode: postCode,
            },
            product: cartArr,
            date: new Date().toDateString(),
            time: new Date().getHours() + ":" + new Date().getMinutes(),
            subTotal: subTotal,
        });
        if (newOrder) {
            res.status(200).send(newOrder);
        } else {
            res.statusMessage("Something went wrong ");
        }
    }
});

module.exports = router;