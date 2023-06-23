const express = require('express');
const router = express.Router();
const db = require('../models');
const { User } = db;
/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const user = await User.create({
      firstName: "Nirav",
    }, { transaction: "t" });
    console.log(db);
    res.render('index', { title: 'Express' });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
