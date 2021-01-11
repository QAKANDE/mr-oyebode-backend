
const express = require("express");
const router = express.Router();
const profileModel = require("../users/schema");
const { authenticate, refreshToken, generateToken } = require ("../users/authTools")
const { authorize } = require("../services/middlewares/authorize")



router.get("/", async (req, res, next) => {
  try {
    const users = await profileModel.find();
    res.status(201).send(users);
  } catch (error) {
    next(error);
  }
});


router.post("/register", async (req, res, next) => {
  try {
    const newUser = new profileModel(req.body);
    const { _id } = await newUser.save();
    console.log(newUser._id);
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});


router.post("/login", async (req, res, next) => {
  try {
   
    const { email, password } = req.body;

    const user = await profileModel.findByCredentials(email, password);
  
    const tokens = await generateToken(user);

    if (user) {
    res.setHeader("Content-Type" , "application/json")
      res.send(tokens)
    }
  } catch (error) {
    next(error);
  }
});



router.get("/:email", authorize , async (req, res, next) => {
try {
  const user = await profileModel.find()
  const filteredUser = user.filter((user => user.email === req.params.email))
  res.send(filteredUser[0])  
} catch (error) {
  console.log(error)
}
})

module.exports = router