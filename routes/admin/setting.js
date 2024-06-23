const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models/");
const moment = require("moment");

router.get("/", authentication, checkAccess("setting"), async function (req, res, next) {
	try {
		const setting = await db.Setting.findOne();
		let configurations = {};
		if (setting) {
			configurations = setting.toJSON();
		}
		res.render("settings/setting", {
			title: "KidsDoc | Setting",
			data: configurations,
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/", authentication, checkAccess("post/setting"), async function (req, res, next) {
	try {
		const { mailServer, from, username, password, port, GoogleAPIkeys, OAuthclientID, razorpayAPIKeyID, KeySecret, protocol } = req.body;

		await db.Setting.update(
			{
				mailServer,
				from,
				username,
				password,
				port,
				GoogleAPIkeys,
				OAuthclientID,
				razorpayAPIKeyID,
				KeySecret,
				protocol,
				updatedDate: moment.utc(),
			},
			{
				where: {
					settingId: 2,
				},
			}
		);

		res.send({
			status: 200,
			message: "SUCCESS",
			type: "success",
		});
	} catch (error) {
		console.log(error);
	}
});
module.exports = router;
