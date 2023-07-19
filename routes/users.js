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
      date_of_birth,
      qualifications,
      gender,
      price,
      password,
      photo_url,
      phone,
      department
    } = req.body;

    const passwordEncrypt = convertToMd5(password);
    const customer = await db.User.create({
      firstName,
      lastName,
      type: "DOCTOR",
      email,
      dateOfBirth: date_of_birth,
      qualifications,
      department,
      gender,
      price,
      password: passwordEncrypt,
      status: true,
      photoUrl: photo_url,
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
      const data = USER.rows;
      const count = USER.count;
      let totalIncome = 0;

      for (let i = 0; i < data.length; i++) {
        const price = parseFloat(data[i].price);
        totalIncome += price;
      }
      console.log(totalIncome);
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
          "department",
          "qualifications",
          "photo_url",
        ],
        where: {
          department,
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
        "department",
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
          "department",
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

router.post("/doctor-department", async function (req, res, next) {
  try {
    const { code } = req.body;
    console.log(req.body);
    if (code === "778899") {
      const listOfDepartment = await db.Department.findAll({
        // order: [
        //   ['department_name', 'ASC'],
        // ],
        attributes: [
          ['department_id', 'id'],
          [
            'department_name',
            'title'
          ],
          [
            'description',
            'description'
          ],
        ],
        raw: true,
        limit: 10,
        tableName: "department"
      });
      console.log(listOfDepartment);
      res.send(listOfDepartment);
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-department", async function (req, res, next) {
  try {
    const { code, departmentName, description, status, photo_url } = req.body;
    console.log(req.body);
    if (code === "778899") {
      await db.Department.create({
        departmentName,
        description,
        status,
        photo_url
      }).then((doctor) => {
        res.send(200, "Department created successfully:", doctor);
      }).catch((error) => {
        console.error('Error creating doctor:', error);
      });

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



module.exports = router;
