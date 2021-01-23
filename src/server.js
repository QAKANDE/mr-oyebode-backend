const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const newCart = require("./cart/index");
const products = require("./products/index");
const users = require("./users/index");
const admin = require("./admin/index");
const review = require("./Reviews/index");
const payment = require("./payment/index");
const order = require("./orders/index");

const server = express();
const port = process.env.PORT || 3001;

// server.use(bodyParser.urlencoded({ extended: true }));
// server.use(bodyParser.json());
server.use(cors());
server.use(express.json());
server.use("/cart", newCart);
server.use("/product", products);
server.use("/users", users);
server.use("/admin", admin);
server.use("/reviews", review);
server.use("/payment", payment);
server.use("/orders", order);

mongoose
    .connect("mongodb://localhost:27017/mr-akintunde-e-commerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(
        server.listen(port, () => {
            console.log("Server is running on port", port);
        })
    )
    .catch((err) => console.log(err));