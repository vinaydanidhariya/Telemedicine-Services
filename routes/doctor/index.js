const express = require("express");
const router = express.Router();

router.get("/list", function (req, res, next) {
    res.send("FUCK OFFAVO")
});

router.get("/schedule", function (req, res, next) {
    res.send("FUCK OFFAVO 2")
});

router.get("/appointments", function (req, res, next) {
    res.send("FUCK OFFAVO 3")
});

module.exports = router;
