const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/patient-list", authentication, checkAccess("patient/patient-list"), async function (req, res, next) {
	try {
		res.render("patient/patient-list", {
			title: "PATIENT-LIST",
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/admin-patient-list", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		// if (code === "778899") {
		const USER = await db.WhatsappUser.findAll({
			attributes: [
				"userId",
				"full_name",
				"gender",
				"selected_doctor",
				"phone",
				"user_stat",
				"appointment_date",
				"price",
				"email"
			],
		});
		console.log(USER);
		res.send(USER);
		// } else {
		//   res.send("error");
		// }
	} catch (error) {
		console.log(error);
	}
});


module.exports = router;
