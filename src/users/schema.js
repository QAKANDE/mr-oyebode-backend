const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");

const profileSchema = new Schema({
    userName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        validate: {
            validator: async function(email) {
                const user = await profileModel.find({ email: email });
                if (user.length > 0) {
                    let error = new Error();
                    error.message = "THIS EMAIL ALREADY EXISTS";
                    throw error;
                } else return true;
            },
            message: "User already exists!",
        },
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
    },
}, { timestamps: true });
profileSchema.statics.findByCredentials = async(email, password) => {
    const user = await profileModel.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error("Unable to login");
        err.httpStatusCode = 401;
        throw err;
    }
    return user;
};

profileSchema.pre("save", async function(next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});
profileSchema.post("validate", function(error, doc, next) {
    if (error) {
        error.httpStatusCode = 400;
        next(error);
    } else {
        next();
    }
});

profileSchema.post("save", function(error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        error.httpStatusCode = 400;
        next(error);
    } else {
        next();
    }
});
const profileModel = model("users", profileSchema);

module.exports = profileModel;