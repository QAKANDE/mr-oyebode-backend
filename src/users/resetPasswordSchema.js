const { model, Schema } = require("mongoose");
const mongoose = require("mongoose");

const resetPasswordSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

const resetPasswordModel = model("reset-password-tokens", resetPasswordSchema);

module.exports = resetPasswordModel;