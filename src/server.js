const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const newCart = require("./newCart/index")
const cart = require("./cart/index")
const products = require("./products/index")




const server = express();
const port = process.env.PORT || 3003;





server.use(cors());
server.use(express.json());
server.use("/cart", newCart)
server.use("/product", products)



mongoose.connect("mongodb://localhost:27017/mr-akintunde-e-commerce", {
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