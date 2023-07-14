let CryptoJS = require("crypto-js");
const db = require('../models/')
const config = require('../config/config.js')
module.exports = {
	login: async function (app) {
		try {
			const passport = require("passport"),
				LocalStrategy = require("passport-local").Strategy;
			app.use(passport.initialize());
			app.use(passport.session());
			const md5 = require("md5");
			//user login through passport js using mongo DB
			passport.use(
				new LocalStrategy(
					{
						usernameField: "email",
						passwordField: "password",
						passReqToCallback: true,
					},
					/**function for login user
					 * @param  {string} username
					 * @param  {string} password
					 * @param  {Function} done
					 * @return {[type]}
					 */
					function (req, username, password, done) {
						username = username.toLowerCase();
						db.User.findOne({
							where: {
								email: username,
							},
							raw: true
						})
							.then(async function (user) {
								// if user not found
								if (!user) {
									return done(null, false, {
										message:
											"Please enter valid login details",
									});
								} else {
									// check user must active and not deleted
									if (
										user.status != "true" ||
										user.deleted
									) {
										return done(null, false, {
											message:
												"User is inactive or deleted.Please contact admin",
										});
									}
									// user = user.toObject();

									if (md5(password) != user.password) {
										console.log(password);
										return done(null, false, {
											message:
												"Please enter valid login details",
										});
									}

									delete user.password;
									return done(null, user);
								}
								// handle catch
							})
							.catch(function (err) {
								console.log(err);
								return done(null, false, {
									message: "Please enter valid login details",
								});
							});
					}
				)
			);
			passport.serializeUser(function (user, done) {
				let cipherText = { logout: true };
				try {
					cipherText = CryptoJS.AES.encrypt(
						JSON.stringify(user),
						config.cipher_key
					).toString();
				} catch (error) {
					console.log(error);
				}
				done(null, cipherText);
			});

			passport.deserializeUser(function (user, done) {
				let data = { logout: true };
				try {
					let plaintext = CryptoJS.AES.decrypt(
						user,
						config.cipher_key
					);
					data = JSON.parse(plaintext.toString(CryptoJS.enc.Utf8));
				} catch (error) {
					console.log(error);
				}
				done(null, data);
			});
		} catch (error) {
			console.log("error----------------");
			console.log(error);
		}
		// create object of passposrt authentication and strategy
	},
	check_auth: async function (req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.logout != undefined && req.user.logout == true) {
				req.logout(); //passport logout method
				//set flash message
				res.send({
					status: 403,
					message: "You are not authorized Please login first",
					type: "error",
				});
				//redirect to requested page
				res.redirect("/?u=" + req.originalUrl);
			}
			return next(); //return next
		} else {
			console.log(req.originalUrl.includes('/admin'));
			if (req.originalUrl.includes('/admin')) {
				res.redirect('/admin/error')
			} else {
				res.send({
					status: 403,
					message: "You are not authorized Please login first",
					type: "error",
				});
			}
		}

	},
	admin_login: async function (app) {
		try {
			const passport = require("passport"),
				LocalStrategy = require("passport-local").Strategy;
			app.use(passport.initialize());
			app.use(passport.session());
			const md5 = require("md5");
			//user login through passport js using mongo DB
			passport.use(
				new LocalStrategy(
					{
						usernameField: "email",
						passwordField: "password",
						passReqToCallback: true,
					},
					/**function for login user
					 * @param  {string} username
					 * @param  {string} password
					 * @param  {Function} done
					 * @return {[type]}
					 */
					function (req, username, password, done) {
						username = username.toLowerCase();
						db.models.admin
							.findOne({
								email: {
									$regex: "^" + username + "$",
									$options: "i",
								},
								deleted: false,
							})
							.then(async function (user) {
								// if user not found
								if (!user) {
									return done(null, false, {
										message:
											"Please enter valid login details",
									});
								} else {
									// check user must active and not deleted
									if (
										user.status != "active" ||
										user.deleted
									) {
										return done(null, false, {
											message:
												"User is inactive or deleted.Please contact admin",
										});
									}
									user = user.toObject();

									if (md5(password) != user.password) {
										return done(null, false, {
											message:
												"Please enter valid login details",
										});
									}

									delete user.password;
									return done(null, user);
								}
								// handle catch
							})
							.catch(function (err) {
								console.log(err);
								return done(null, false, {
									message: "Please enter valid login details",
								});
							});
					}
				)
			);
			passport.serializeUser(function (user, done) {
				let cipherText = { logout: true };
				try {
					cipherText = CryptoJS.AES.encrypt(
						JSON.stringify(user),
						config.cipher_key
					).toString();
				} catch (error) {
					console.log(error);
				}
				done(null, cipherText);
			});

			passport.deserializeUser(function (user, done) {
				let data = { logout: true };
				try {
					let plaintext = CryptoJS.AES.decrypt(
						user,
						config.cipher_key
					);
					data = JSON.parse(plaintext.toString(CryptoJS.enc.Utf8));
				} catch (error) {
					console.log(error);
				}
				done(null, data);
			});
		} catch (error) {
			console.log("error----------------");
			console.log(error);
			next();
		}
		// create object of passposrt authentication and strategy
	},
	admin_check_auth: async function (req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.logout != undefined && req.user.logout == true) {
				req.logout(); //passport logout method
				//set flash message
				res.send({
					status: 403,
					message: "You are not authorized Please login first",
					type: "error",
				});
				//redirect to requested page
				res.redirect("/?u=" + req.originalUrl);
			}
			return next(); //return next
		}
		res.send({
			status: 403,
			message: "You are not authorized Please login first",
			type: "error",
		});
	},
};
