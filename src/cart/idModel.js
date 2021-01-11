const mongoose = require("mongoose");

const idModels = new mongoose.Schema(
  {
    user: {
    type : String    
    }
  },
  { timestamps: true   }
);

module.exports = mongoose.model("mod", idModels);