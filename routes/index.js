"use strict";
const { sendApiResponse, convertToMd5 } = require("../utils/helper");
const nodeMailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { updateURL } = require("../helpers/ABHAFacilities");

let db = require("../models");
const express = require("express");
const router = express.Router();
//1//0gLXw_CJGs4qYCgYIARAAGBASNwF-L9Ir9RsJhDH2mKkYsuxE6o7Lpd44vLYlwTj9Gv6EDG5uxn7iw0GyxNkakPwfHUsC0yFI5g8
router.get("/", function (req, res, next) {
	// updateURL();
	res.send("SERVER RUNNING");
});

router.get("/createFirstRecords", async function (req, res, next) {
	try {
		const refreshToken = "1//0gLXw_CJGs4qYCgYIARAAGBASNwF-L9Ir9RsJhDH2mKkYsuxE6o7Lpd44vLYlwTj9Gv6EDG5uxn7iw0GyxNkakPwfHUsC0yFI5g8";

		// Create a new record in the setting table
		await db.Setting.create({
			refreshToken: refreshToken,
		});

		res.send("Record created successfully");
	} catch (error) {
		console.error(error);
		res.status(500).send("Error creating record");
	}
});

router.get("/payment", async function (req, res, next) {
	const { id } = req.query;
	if (id) {
		res.render("payment/payment", {
			title: "WhatsApp Payment",
			layout: false,
			orderId: id,
		});
	} else {
		res.render("payment-error");
	}
});

router.get("/forgot-password", async function (req, res, next) {
	res.render("login/forget-password", {
		title: "Forget Password",
		layout: false,
	});
});

router.post("/forgot-password", async (req, res) => {
	const { email } = req.body;
	const transporter = nodeMailer.createTransport({
		service: "Gmail",
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS,
		},
	});

	try {
		if (email) {
			// Find user by email using Sequelize
			const user = await db.User.findOne({
				where: {
					email: email,
				},
			});
			console.log(user);
			if (!user) {
				return sendApiResponse(res, 404, "error", "User not found");
			}

			// Set token expiration to 1 hour from now
			const resetToken = uuidv4();

			const resetTokenExpiration = Date.now() + 3600000;

			// Update user with token and expiration using Sequelize
			await db.User.update(
				{
					resetToken,
					resetTokenExpiration,
				},
				{
					where: { email },
				}
			);

			// Send password reset email
			const mailOptions = {
				from: process.env.NODEMAILER_USER,
				to: email,
				subject: "Password Reset Request",
				text: `Click the link to reset your password: ${process.env.SERVER_URL}/reset-password/${resetToken}`,
			};

			await transporter.sendMail(mailOptions);

			sendApiResponse(res, 200, "success", "Password reset email sent");
		} else {
			sendApiResponse(res, 403, "error", "Something went wrong");
		}
	} catch (error) {
		console.error(error);
		sendApiResponse(res, 500, "error", "Email could not be sent");
	}
});

router.get("/reset-password/:token", async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	const user = await db.User.findOne({
		where: {
			resetToken: token,
			resetTokenExpiration: { [db.Sequelize.Op.gt]: Date.now() },
		},
	});

	if (!user) {
		return res.render("password-reset-token-expire", { layout: false, message: "Invalid or expired reset token" });
	} else {
		res.render("login/reset-password", { layout: false, email: user.email, token: user.resetToken });
	}
});
// POST route for resetting password
router.post("/reset-password/:token", async (req, res) => {
	const { password } = req.body;
	const { token } = req.params;
	// Find user by reset token and expiration (replace with database query)
	const user = await db.User.findOne({
		where: {
			resetToken: token,
			resetTokenExpiration: { [db.Sequelize.Op.gt]: Date.now() },
		},
	});

	if (!user) {
		return res.render("401", { message: "Invalid or expired reset token" });
	} else {
		const hashedPassword = convertToMd5(password);
		await db.User.update(
			{
				password: hashedPassword,
				resetToken: null,
				resetTokenExpiration: null,
			},
			{
				where: {
					resetToken: token,
				},
			}
		);
		return sendApiResponse(res, 200, "success", "Password reset successful");
	}
});

router.get("/error", async function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.type === "DOCTOR") {
			res.render("doctor-error", {
				title: "PAGE UNAVAILABLE",
				layout: false,
			});
		} else if (req.user.type === "ADMIN") {
			res.render("admin-error", {
				title: "PAGE UNAVAILABLE",
				layout: false,
			});
		}
	} else {
		res.render("admin-error", {
			title: "PAGE UNAVAILABLE",
			layout: false,
		});
	}
});

module.exports = router;
