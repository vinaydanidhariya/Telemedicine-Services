const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;

router.get("/", authentication, function (req, res, next) {
    try {
        res.render("settings/setting", {
            title: "ChildDR | Setting",
            // layout: 'default',
            sessionUser: req.user
        });
    } catch (error) {
        console.log(error)
    }
});

module.exports = router;
