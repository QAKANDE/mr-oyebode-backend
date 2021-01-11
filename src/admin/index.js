const express = require("express");
const router = express.Router();
const adminModel = require("../admin/schema");
const shortId = require("short-id")

router.post("/admin-login", async (req, res) => {
    const adminToken = process.env.ADMIN_TOKEN
    const admin = await adminModel.find()
    const findAdmin = admin.filter(admin => admin.firstName === req.body.firstName)
    if (findAdmin && req.body.token === adminToken) {
        res.send("Log in successful")
    }
    else {
        res.send("Invalid Credentials")
    }
})

router.post("/new-admin", async (req, res) => {
    try {
    const newUser = new adminModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
    
})

module.exports = router