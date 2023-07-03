const express = require("express");
const router = express.Router();
const db = require("../models");
const { convertToMd5 } = require("../utils/helper.js");
const Sequelize = require("sequelize");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/create-doctor", async function (req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      qualifications,
      specializations,
      gender,
      price,
      password,
      photo_url,
      phone,
    } = req.body;

    const passwordEncrypt = convertToMd5(password);
    const customer = await db.User.create({
      firstName,
      lastName,
      type: "DOCTOR",
      email,
      qualifications,
      specializations,
      gender,
      price,
      password: passwordEncrypt,
      status: true,
      photo_url,
      phone,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    res.send("Add user");
  } catch (error) {
    console.log(error);
  }
});

router.post("/doctor-list", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    if (code === "778899") {
      const USER = await db.User.findAll({
        attributes: [
          "userId",
          "firstName",
          "lastName",
          "price",
          "specializations",
          "qualifications",
          "photo_url",
        ],
        where: {
          specializations: department,
        },
      });

      console.log(USER);
      res.send(USER);
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/admin-doctor-list", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    // if (code === "778899") {
    const USER = await db.User.findAll({
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "price",
        "specializations",
        "qualifications",
        "photo_url",
        "status"
      ],
    });
    console.log(USER);
    res.send(USER);
    // } else {
    //   res.send("error");
    // }
  } catch (error) {
    console.log(error);
  }
});

router.post("/doctor-memeber-list", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    if (code === "778899") {
      const USER = await db.User.findAll({
        attributes: [
          "userId",
          "firstName",
          "lastName",
          "specializations",
          "qualifications",
          "photo_url",
        ],
      });
      console.log(USER);
      res.send(USER);
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/doctor-specializations", async function (req, res, next) {
  try {
    const { code } = req.body;
    console.log(req.body);
    if (code === "778899") {
      const USER = await db.User.findAll({
        attributes: [
          [
            Sequelize.fn("DISTINCT", Sequelize.col("specializations")),
            "specializations",
          ],
        ],
      });

      console.log(USER);
      res.send(USER);
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
