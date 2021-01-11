const router = require("express").Router();
const cartController = require("../cart/helpers/controller")
const cartModel = require("../cart/schema")
const productModel = require("../products/schema")
const objectId = require('mongodb').ObjectID;


router.post("/add-to-cart/:id", async (req, res) => {
    try {
    const productId = req.body.productId
        const quantity = Number.parseInt(req.body.quantity);
        productDetails = await productModel.findById(req.body.productId)
           if (!productDetails) {
                return res.status(500).json({
                    type: "Not Found",
                    msg: "Invalid request"
                })
        }
           else {           
    const allCart = await cartModel.find()
    if (!allCart) {
    const newCart = new cartModel()
    newCart._id = objectId(req.params.id)
    newCart.items[0].productId = productId
    newCart.items[0].quantity = quantity
    newCart.items[0].total = parseInt(productDetails.price * quantity)
    newCart.items[0].price = productDetails.price
    newCart.subTotal = parseInt(productDetails.price * quantity)
    newItem = await newCart.save() 
    res.send(newItem)    
               }
    else if (allCart) {
        const cart = await cartModel.find().populate({
        path: "items.productId",
        select: "name price total"
    });;
             const indexFound = cart.items.findIndex(item => item.productId.id == productId);
                //------This removes an item from the the cart if the quantity is set to zero, We can use this method to remove an item from the list  -------
                if (indexFound !== -1 && quantity <= 0) {
                    cart.items.splice(indexFound, 1);
                    if (cart.items.length == 0) {
                        cart.subTotal = 0;
                    } else {
                        cart.userId =  "abc123"
                        cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                    }
                }
                //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
                else if (indexFound !== -1) {
                    cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                    cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                    cart.items[indexFound].price = productDetails.price
                    cart.items[indexFound].name = productDetails.name
                    cart.userId =  "abc123"
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
                //----Check if quantity is greater than 0 then add item to items array ----
                else if (quantity > 0) {
                    cart.items.push({
                        productId: productId,
                        quantity: quantity,
                        price: productDetails.price,
                        name: productDetails.name,
                        total: parseInt(productDetails.price * quantity)
                    })
                    cart.userId =  "abc123"
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
                //----If quantity of price is 0 throw the error -------
                else {
                    return res.status(400).json({
                        type: "Invalid",
                        msg: "Invalid request"
                    })
                }
                let data = await cart.save();
                res.status(200).json({
                    type: "success",
                    mgs: "Process Successful",
                    data: data
                })


               }
        }
        
    } catch (error) {
        console.log(error)
    }
    
});
router.get("/get-cart", cartController.getCart);
router.delete("/empty-cart", cartController.emptyCart);





// router.post("/newcart/:userId", async (req, res) => {
//     try {
//           const cartToBeSent = []
//     const allCart = await cartModel.find()
//     const findCartForUser = allCart.filter(user => user.userId === req.params.userId)
//     if (findCartForUser.length === 0) { 
//         const total = { totalToBeSent : calculateTotal(req.body.productPrice, req.body.quantity) }
//         req.body = {...req.body  , userId : req.params.userId }
//         const cart = await cartModel(req.body)
//         const newCart = await cart.save()
//         cartToBeSent.push(newCart)
//         cartToBeSent.push(total)
//         res.send(cartToBeSent)
//     }
//     else {
//         if (findCartForUser[0].productName === req.body.productName) {

//              const quantityTobeIncreased = increaseQuantity(findCartForUser[0].quantity)
//             const total = {totalToBeSent : calculateTotal(req.body.productPrice , quantityTobeIncreased)}
//             const findCart = await cartModel.findByIdAndUpdate(
//                 findCartForUser[0]._id,
//                 { quantity: quantityTobeIncreased }
//             )
//             const foundById = await cartModel.findById(findCartForUser[0]._id)
//             cartToBeSent.push(foundById)
//             cartToBeSent.push(total)
//             res.send(cartToBeSent)
//         }
//         else if (findCartForUser[0].productName !== req.body.productName) {
            
//         }
//     }
        
//     } catch (error) {
//         console.log(error)
//         res.send(error)
//     }
// })

// router.get("/allcart", async (req, res) => {
//     const allCart = await cartModel.find()
//     res.send(allCart)
    
// })

// router.post("/increaseQuantity/:userId", async (req, res) => {
//     const allCart = await cartModel.find()
//     console.log(allCart)
    
// })


module.exports = router
