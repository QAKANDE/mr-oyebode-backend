const jwt = require("jsonwebtoken");
const profileModel  = require("../users/schema")
const generateToken = async (user) => {
  try {
    // generate tokens
    const newAccessToken = await generateJWT({ _id: user._id });
     const newUser = await profileModel.findById(user._id);
    newUser.newAccessToken = newAccessToken;
    await newUser.save({ validateBeforeSave: false });
    return {newAccessToken};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      //{ expiresIn: "15m" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyJWT = (token) =>
  new Promise((res, rej) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    });
  });

module.exports = { generateToken, verifyJWT };
