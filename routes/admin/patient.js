const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/patient-list", authentication, async function (req, res, next) {
    try {
        res.render("patient/patient-list", {
            title: "PATIENT-LIST",
        });
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;
