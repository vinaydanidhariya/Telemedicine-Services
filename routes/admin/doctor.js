const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/add-doctor", authentication, async function (req, res, next) {
  try {
    res.render("doctors/add-doctor", {
      title: "ADD-DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/list-doctors", authentication, async function (req, res, next) {
  try {
    res.render("doctors/list-doctors", {
      title: "LIST-DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
