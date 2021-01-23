const router = require("express").Router();
const orderModel = require("./schema");
const cartModel = require("../cart/schema");

router.get("/orders", async(req, res) => {
    try {
        notDeliveredArray = [];
        deliveredArray = [];

        const allOrders = await orderModel.find();

        res.json(allOrders);
    } catch (error) {
        console.log(error);
    }
});

router.get("/search-orders-by-customerid", async(req, res) => {
    try {
        const { customerId } = req.body;
        const allOrders = await orderModel.find();
        const filteredOrderByCustomerId = allOrders.filter(
            (order) => order.customerId === customerId
        );
        res.send(filteredOrder);
    } catch (error) {
        console.log(error);
    }
});

router.get("/search-orders-by-date", async(req, res) => {
    try {
        const { date } = req.body;
        const allOrders = await orderModel.find();
        const filteredByDate = allOrders.filter((order) => order.date === date);
        res.send(filteredByDate);
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
            console.log(typeof newOrder);
        } else {
            res.statusMessage("Something went wrong ");
        }
    }
});

router.put("/changeOrderStatus/:orderId", async(req, res) => {
    const allOrders = await orderModel.findByIdAndUpdate(req.params.orderId, {
        status: "Delivered",
    });
    res.send("Status changed");
});

module.exports = router;