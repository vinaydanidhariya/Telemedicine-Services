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

module.exports = router;
