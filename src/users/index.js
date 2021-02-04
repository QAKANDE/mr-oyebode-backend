const express = require("express");
const router = express.Router();
const profileModel = require("../users/schema");
const addressModel = require("../users/addressSchema");
const objectId = require("mongodb").ObjectID;
const cartModel = require("../cart/schema");
const userOrderModel = require("./ordersSchema");
const {
    authenticate,
    refreshToken,
    generateToken,
} = require("../users/authTools");
const { authorize } = require("../services/middlewares/authorize");

router.get("/", async(req, res, next) => {
    try {
        const users = await profileModel.find();
        res.status(201).send(users);
    } catch (error) {
        console.log(error);
    }
});

router.get("/:id", async(req, res) => {
    try {
        const user = await profileModel.findById(req.params.id);
        res.send(user);
    } catch (error) {
        console.log(error);
    }
});

router.get("/user-order/:userId", async(req, res) => {
    try {
        const { id } = req.params.userId;
        const order = await userOrderModel.findOne({ id });
        if (!order) {
            res.json({
                message: "No Order Available",
            });
        } else {
            res.send(order);
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/user-address/:userId", async(req, res) => {
    try {
        const address = await addressModel.findById(req.params.userId);
        if (!address) {
            res.json({
                message: "Please Update Your Address",
            });
        } else {
            res.send(address);
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/user-order/:userId", async(req, res) => {
    try {
        cartArr = [];
        const { id } = req.params.userId;
        const cartPerUser = await cartModel.findOne({ id });

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
                    date: new Date().toDateString(),
                    time: new Date().getHours() + ":" + new Date().getMinutes(),
                };
                cartArr.push(cartDetails);
            }
            const newOrder = await userOrderModel.create({
                userId: req.params.userId,
                products: cartArr,
            });
            res.send("User Order added");
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/register", async(req, res, next) => {
    try {
        const newUser = new profileModel(req.body);
        const { _id } = await newUser.save();
        res.status(201).send(_id);
    } catch (error) {
        console.log(error);
    }
});

router.post("/guest-token-already-exists/:guestToken", async(req, res) => {
    try {
        const { userName, email, phoneNumber, password } = req.body;

        const newUser = new profileModel();
        newUser._id = objectId(req.params.guestToken);
        newUser.userName = userName;
        newUser.email = email;
        newUser.phoneNumber = phoneNumber;
        newUser.password = password;
        const userSentToApi = await newUser.save();
        res.status(201).send(userSentToApi);
    } catch (error) {
        res.status(400).send("Bad Request");
        console.log(error);
    }
});

router.post("/user-address/:userId", async(req, res) => {
    try {
        const { addressLine1, addressLine2, country, county, postCode } = req.body;
        const address = await addressModel();
        address._id = objectId(req.params.userId);
        address.addressLine1 = addressLine1;
        address.addressLine2 = addressLine2;
        address.country = country;
        address.county = county;
        address.postCode = postCode;
        const newAdress = await address.save();
        res.send("Address Added");
    } catch (error) {
        console.log(error);
    }
});

router.post("/login", async(req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await profileModel.findByCredentials(email, password);

        const tokens = await generateToken(user);

        if (user) {
            res.setHeader("Content-Type", "application/json");
            res.send(tokens);
        }
    } catch (error) {
        next(error);
    }
});

router.get("/:email", authorize, async(req, res, next) => {
    try {
        const user = await profileModel.find();
        const filteredUser = user.filter((user) => user.email === req.params.email);
        res.send(filteredUser[0]);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;