const { model, Schema } = require("mongoose");


const addressSchema = new Schema({
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    country: { type: String, required: true },
    county: { type: String, required: true },
    postCode: { type: String, required: true },
});

const addressModel = model("address", addressSchema);

module.exports = addressModel;