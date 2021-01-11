const Product = require("../products/schema")


const products = async () => {
    const products = await Product.find();
    return products;
};

 const productById = async id => {
    const product = await Product.findById(id);
    return product;
}
const createProduct = async payload => {
    const newProduct = await Product.create(payload);
    return newProduct
}
const removeProduct = async id => {
    const product = await Product.findByIdAndRemove(id);
    return product
}

module.exports = {products , productById , createProduct , removeProduct}