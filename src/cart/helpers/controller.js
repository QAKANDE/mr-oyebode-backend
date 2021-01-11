const cartRepo = require("./functions")
const { products, productById, createProduct, removeProduct } = require("../../products/functions")
const objectId = require('mongodb').ObjectID;
exports.addItemToCart = async (req, res) => {
   
    const productId = req.body.productId
    const quantity = Number.parseInt(req.body.quantity);
        try {
            let cart = await cartRepo.cart();
            let productDetails = await productById(req.body.productId);
                 if (!productDetails) {
                return res.status(500).json({
                    type: "Not Found",
                    msg: "Invalid request"
                })
            }
            if (!cart) { 
                
                const cartData = {
                    id : "5fea588a6491d2278c09cbd6" ,
                    items: [{
                        productId:productId,
                        quantity: quantity,
                        total: parseInt(productDetails.price * quantity),
                        price: productDetails.price,
                        
                    }],
                    subTotal: parseInt(productDetails.price * quantity) ,
                    userId: "abc123",
            
                }
                cart = await cartRepo.addItem(cartData)
                res.json(cart);
            }
            else if (cart) {
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
           
        } catch (err) {
            console.log(err)
            res.status(400).json({
                type: "Invalid",
                msg: "Something Went Wrong",
                err: err
            })
        }
}
    

    exports.getCart = async (req, res) => {
        try {
            let cart = await cartRepo.cart();
            if (!cart) {
                return res.status(400).json({
                    type: "Invalid",
                    msg: "Cart not found",
                })
            }
            res.status(200).json({
                status: true,
                data: cart
            })
        } catch (err) {
            console.log(err)
            res.status(400).json({
                type: "Invalid",
                msg: "Something went wrong",
                err: err
            })
        }
    }
exports.emptyCart = async (req, res) => {
    try {
        let cart = await cartRepo.cart();;
        cart.items = [];
        cart.subTotal = 0
        let data = await cart.save();
        res.status(200).json({
            type: "Success",
            mgs: "Cart has been emptied",
            data: data
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something went wrong",
            err: err
        })
    }
}
    