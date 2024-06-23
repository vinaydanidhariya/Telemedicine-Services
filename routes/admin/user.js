const express = require("express");
const router = express.Router();
const db = require("../../models");
const passport = require("passport");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { verifyOTP } = require("../../utils/helper");
const authentication = require("../../middleware/login_module").check_auth;
const config = require("../../config/config.js");
const { checkAccess } = require("../../middleware/authorization");
const rateLimit = require("express-rate-limit");

router.get("/", async function (req, res, next) {
	if (req.isAuthenticated()) {
		const user = await db.User.findOne({
			where: { userId: req.user.userId },
		});
		if (user.isOTP) {
			const dashboardPath =
				req.user.type === "ADMIN"
					? "/admin/dashboard"
					: "/doctor/dashboard";
			return res.redirect(dashboardPath);
		} else {
			return res.redirect("/admin/verify-otp");
		}
	}

	res.render("login/login", {
		title: "Login",
		layout: false,
	});
});

router.get("/profile", authentication, function (req, res, next) {
	res.render("profile/profile", {
		title: "Dashboard",
	});
});

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5,
	message: { error: "Too many login attempts, please try again later." },
});

router.post("/", function (req, res, next) {
	try {
		passport.authenticate("local", async function (err, user, info) {
			if (err || !user) {
				res.send({
					status: 500,
					message: "Credentials are wrong! Please enter again.",
					type: "error",
				});
			} else {
				//establish session
				req.logIn(user, async function (err) {
					// Invalid password
					if (err) {
						console.log(err);
						return res.send({
							status: 500,
							message: "Login failed",
							type: "error",
						});
					} else {
						const token = jwt.sign(req.user, config.JWTMaster);
						const sessionId = uuidv4();

						req.user.sessionId = sessionId;
						return res.send({
							status: 200,
							message: "Login successful",
							type: "success",
							user: {
								access_token: token,
								data: req.user,
							},
						});
					}
				});
			}
		})(req, res, next);
	} catch (error) {
		console.log(error);
	}
});

router.get("/verify-otp", function (req, res, next) {
	res.render("login/auth-otp", {
		layout: false,
		email: req.user.email,
		title: "Verify Otp",
	});
});

// Route to handle OTP verification
router.post("/verify-otp", async function (req, res) {
	try {
		const userPhoneNumber = req.user.phone;
		const { opt } = req.body;
		if (!userPhoneNumber) {
			return res.send({
				status: 400,
				message: "Invalid Phone",
				type: "error",
			});
		}
		// Verify OTP
		const isOTPValid = await verifyOTP(userPhoneNumber, opt);

		if (!isOTPValid) {
			return res.send({
				status: 400,
				message: "Invalid OTP",
				type: "error",
			});
		}
		// if (req.user.email != 'admin@admin.in') {
		//     return res.send({
		//         status: 400,
		//         message: "Login Failed! Insufficient privilages",
		//         type: "error"
		//     });
		// }
		return res.send({
			status: 200,
			message: "Login successful",
			type: "success",
		});
	} catch (error) {
		console.log(error);
		return res.send({
			status: 500,
			message: "An error occurred",
			type: "error",
		});
	}
});

router.get("/logout", checkAccess("logout"), async function (req, res, next) {
	await db.User.update(
		{ isOTP: false },
		{
			where: { userId: req.user.userId },
		}
	);
	res.clearCookie(); //clear cookie
	req.logout();
	res.redirect("/admin");
});

module.exports = router;
