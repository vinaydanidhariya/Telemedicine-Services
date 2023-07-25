const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;


router.get("/dashboard", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.send("doctor dashboard")
});

router.get("/list", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.send("list")
});

router.get("/schedule", authentication, checkAccess("doctor/schedule"), function (req, res, next) {
	res.send("schedule")
});

router.get("/appointments", authentication, checkAccess("doctor/appointments-list"), function (req, res, next) {
	res.send("appointments")
});

module.exports = router;
