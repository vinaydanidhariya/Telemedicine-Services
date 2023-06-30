const express = require("express");
const router = express.Router();
const db = require("../models");

router.get("/add-doctor", async function (req, res, next) {
  try {
    res.render("doctors/add-doctor", {
      title: "ADD-DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
