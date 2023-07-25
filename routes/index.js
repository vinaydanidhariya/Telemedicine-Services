const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
	res.send("SERVER RUNNING")
});

router.get("/payment", async function (req, res, next) {
	const { id } = req.query
	if (id) {
		res.render("payment/payment", {
			title: "WhatsApp Payment",
			layout: false,
			orderId: id
		});
	} else {
		res.render("payment-error");
	}
});

router.get("/error", async function (req, res, next) {
	res.render("error", {
		title: "PAGE UNAVAILABLE",
		layout: false
	});
});

module.exports = router;
