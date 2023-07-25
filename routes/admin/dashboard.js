
const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;

router.get("/", authentication, checkAccess('admin/dashboard'), function (req, res, next) {
	try {
		res.render("dashboard/dashboard", {
			title: "ChildDR | Dashboard",
		});
	} catch (error) {
		console.log(error)
	}
});
router.get("/reports", authentication, checkAccess('admin/report'), function (req, res, next) {
	try {
		res.render("dashboard/reports", {
			title: "ChildDR | Reports",
		});
	} catch (error) {
		console.log(error)
	}
});

module.exports = router;