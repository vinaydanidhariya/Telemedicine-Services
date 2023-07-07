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

router.post("/wa-user", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    if (code === "778899") {
      const USER = await db.WhatsappUser.findAndCountAll({
        attributes: ["price"],
      });
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++");
      const data = USER.rows;
      let totalIncome = 0;

      for (let i = 0; i < data.length; i++) {
        const price = parseFloat(data[i].price);
        totalIncome += price;
      }
      console.log(totalIncome);
      return res.send({
        status: 200,
        message: totalIncome,
        type: "success",
      });
    } else {
      res.send("error");
    }
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
    res.send(USER);
    // } else {
    //   res.send("error");
    // }
  } catch (error) {
    console.log(error);
  }
});

router.post("/admin-patient-list", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    // if (code === "778899") {
    const USER = await db.WhatsappUser.findAll({
      attributes: [
        "userId",
        "full_name",
        "gender",
        "selected_doctor",
        "phone",
        "user_stat",
        "appointment_date",
        "price",
        "email"
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

router.post("/admin-payment-list", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    // if (code === "778899") {
    const USER = await db.PaymentTransaction.findAll({
      attributes: [
        "transaction_Id",
        "order_id",
        "payer_user_id",
        "payment_date",
        "Payment_transaction_id",
        "payer_name",
        "payer_email",
        "payer_mobile",
        "payment_amount",
        "payment_status"
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

router.post('/add-whatsappuser', async (req, res) => {
  try {
    const newUser = await db.WhatsappUser.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a new user.' });
  }
});

router.post("/doctor-count", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    if (code === "778899") {
      const USER = await db.User.findAndCountAll({});
      console.log(USER.count);
      const data = USER.count;
      return res.send({
        status: 200,
        message: data,
        type: "success",
      });
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/wa-user", async function (req, res, next) {
  console.log(req.body);
  try {
    const { code, department } = req.body;
    if (code === "778899") {
      const USER = await db.WhatsappUser.findAndCountAll({
        attributes: ["price"],
      });
      const count = USER.count;
      console.log(count);
      const data = USER.rows;
      let totalIncome = 0;

      for (let i = 0; i < data.length; i++) {
        const price = parseFloat(data[i].price);
        totalIncome += price;
      }
      return res.send({
        status: 200,
        message: totalIncome,
        count: count,
        type: "success",
      });
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
