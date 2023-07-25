const express = require("express");
const router = express.Router();
const db = require("../../models");
const passport = require("passport");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const authentication = require("../../middleware/login_module").check_auth;
const config = require('../../config/config.js');
const { checkAccess } = require("../../middleware/authorization");

router.get("/", checkAccess("admin"), function (req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/admin/dashboard');
	} else {
		res.render("login/login", {
			title: "Dashboard",
			layout: false
		});
	}
});

router.post("/", checkAccess("post/admin"), function (req, res, next) {
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
						console.log(req.user);
						const sessionId = uuidv4();

						req.user.sessionId = sessionId;
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
							user: {
								access_token: token,
								data: req.user,
							}
						});
					}
				});
			}
		})(req, res, next);
	} catch (error) {
		console.log(error)
	}

});


router.get("/logout", checkAccess('logout'), function (req, res, next) {
	res.clearCookie(); //clear cookie
	req.logout();
	res.redirect('/admin')
});


module.exports = router;
