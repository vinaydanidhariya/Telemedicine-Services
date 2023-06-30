const express = require("express");
const router = express.Router();
const db = require("../models");
const { User } = db;
/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    res.render("login/login", { layout: false });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
router.get("/dashboard", async function (req, res, next) {
  try {
    res.render("dashboard/dashboard", {
      title: "Dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/add-doctors", async function (req, res, next) {
  try {
    res.render("doctors/add-doctors", {
      title: "ADD-DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
