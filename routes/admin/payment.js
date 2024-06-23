const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/payment-list", authentication, checkAccess("payment/payment-list"), async function (req, res, next) {
	try {
		res.render("payment/payment-list", {
			title: "PAYMENT-LIST",
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/payment-list", async function (req, res, next) {
	try {
		const { code, department } = req.body;
		// if (code === "778899") {
		const USER = await db.PaymentTransaction.findAll({
			attributes: [
				"transaction_Id",
				"order_id",
				"payer_user_id",
				"payment_date",
				"payment_transaction_id",
				"payer_name",
				"payer_email",
				"payer_mobile",
				"payment_amount",
				"payment_status"
			],
		});
		res.send(USER);
		// } else {
		//   res.send("error");
		// }
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
