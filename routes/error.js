const express = require("express");
const router = express.Router();
const authentication = require("../middleware/login_module").check_auth;

router.get("/", async function (req, res, next) {
    res.render("error", {
        title: "Dashboard",
        layout: false
    });
});

module.exports = router;
