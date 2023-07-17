const express = require("express");
const { log } = require("handlebars");
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
router.post("/", authentication, function (req, res, next) {
    try {
      console.log(req.body,"+++++++++++++++++++++++");
    } catch (error) {
        console.log(error)
    }
});

module.exports = router;
