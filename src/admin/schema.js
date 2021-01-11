const { model, Schema } = require("mongoose");

const adminSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: {
      type: String,
      required: true,
    },
})

const adminModel = model("admin", adminSchema);

module.exports = adminModel;