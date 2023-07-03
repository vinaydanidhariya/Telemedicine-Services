
const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;

router.get("/", authentication, function (req, res, next) {
    try {
        res.render("dashboard/dashboard", {
            title: "ChildDR | Dashboard",
            // layout: 'default'
            sessionUser: req.user
        });
    } catch (error) {
        console.log(error)
    }
});
router.get("/reports", authentication, function (req, res, next) {
    try {
        res.render("dashboard/reports", {
            title: "ChildDR | Reports",
            // layout: 'default'
            sessionUser: req.user
        });
    } catch (error) {
        console.log(error)
    }
});

module.exports = router;