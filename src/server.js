const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const newCart = require("./cart/index")
const products = require("./products/index")
const users = require("./users/index")
const admin = require("./admin/index")




const server = express();
const port = process.env.PORT || 3001;



server.use(cors());
server.use(express.json());
server.use("/cart", newCart)
server.use("/product", products)
server.use("/users", users)
server.use("/admin" , admin)



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