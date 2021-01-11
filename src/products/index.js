const router = require("express").Router();

const { calculateTotal,
    increaseQuantity,
    decreaseQuantity,
    products, productById,
    createProduct,
    removeProduct } = require("./functions")


router.get("/", products);

router.get("/", async (req, res) => {
    const allProducts = await products()
    res.json(allProducts)
})


router.get("/:id", async (req, res) => {
    const foundProduct = await productById(req.params.id)
    res.json(foundProduct)
});


router.post("/newproduct", async (req, res) => {
    const newProduct = await createProduct(req.body)
    res.send(newProduct)
})


router.delete("/:id", async (req, res) => {
    const productToBeDeleted = await removeProduct(req.params.id)
})




module.exports = router;

