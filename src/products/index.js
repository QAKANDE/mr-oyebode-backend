const router = require("express").Router();
const productModel = require("./schema")


router.get("/", async (req, res) => {
    const products = await productModel.find()
    res.send (products)
});

router.get("/:id", async (req, res) => {
    const foundProduct = await productModel.findById(req.params.id)
    res.json(foundProduct)
});


router.post("/newproduct", async (req, res) => {
  try {
    const newProduct = new productModel(req.body);
 await newProduct.save();
   res.json("Cretaed")
  } catch (error) {
    console.log(error);
  }
})


router.delete("/:id", async (req, res) => {
    const productToBeDeleted = await productModel.findByIdAndDelete(req.params.id)
    res.send("Deleted")
})




module.exports = router;

