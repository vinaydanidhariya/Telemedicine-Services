const express = require('express');
const router = express.Router();
const db = require('../models');
const { User } = db;
/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    res.render('index', { title: 'Express' });
  } catch (error) {
    console.log(error);
  }
});

router.get("/payment", async function (req, res, next) {
  const { id } = req.query
  if (id) {
    res.render("payment", { orderId: id });
  } else {
    res.render("payment-error");
  }
});

module.exports = router;
