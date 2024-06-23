const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;
const moment = require('moment')
var multer = require("multer");

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/slider");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + file.originalname.replace(/\s+/g, "-"));
	},
});

const uploadSourceLeadFile = multer({
	storage: storage, // global posting data upload file storage assign
	limits: {
		// Define limits for the file
		fileSize: 5 * 1024 * 1024, // 5 mb image only allowed
	},
	fileFilter: function (req, file, cb) {
		// Filter the file based on the type.
		if (
			file.mimetype == "image/png" ||
			file.mimetype == "image/jpg" ||
			file.mimetype == "image/jpeg"
		) {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
		}
	},
}).single("slider_photo");

router.get(
	"/add-slider-photo",
	authentication,
	checkAccess("web-settings/slider-photo"),
	function (req, res, next) {
		try {
			res.render("web-settings/slider-photo", {
				title: "Web Setting",
				sessionUser: req.user,
			});
		} catch (error) {
			console.log(error);
		}
	}
);

router.post(
	"/add-slider-photo",
	authentication,
	checkAccess("post/web-settings/slider-photo"),
	async function (req, res, next) {
		try {
			uploadSourceLeadFile(req, res, async function (err) {
				// Check err while upload
				if (err) {
					console.log("Error while uploading image");
					console.log(err);
					return res.send({
						type: "error",
						message: err.message,
					});
				} else {
					const { slider_title, short_description } = req.body;
					console.log(req.body);
					try {
						db.webSlider
							.create({
								sliderTitle: slider_title,
								shortDescription: short_description,
								photo: `/slider/${req.file.filename}`,
								date: moment.utc(),
								updatedDate: moment.utc(),
							})
							.then(() => {
								let message = `webSlider Created successfully`;
								res.send({
									status: 200,
									message,
									type: "success",
								});
							})
							.catch((error) => {
								console.log(error);
								res.send({
									status: 400,
									message: `Something Went Wrong while creating webSlider`,
									type: "fails",
								});
							});
					} catch (error) {
						console.log(error);
						res.send({
							status: 500,
							message: error.message,
							type: "error",
						});
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
);

router.get(
	"/edit-slider-photo/:id",
	authentication,
	checkAccess("event/event-detail"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const event = await db.webSlider.findByPk(id);
			const eventPost = event.toJSON();
			console.log(eventPost);
			if (!eventPost) {
				// event post not found, handle error or redirect to an error page
				res.status(404).send("event not found");
				return;
			}

			res.render("web-settings/edit-slider", {
				title: eventPost.sliderTitle,
				description: eventPost.shortDescription,
				photo: eventPost.photo,
			});
		} catch (error) {
			console.error("Error retrieving event post:", error);
			// Handle errors appropriately
			res.status(500).send("Error retrieving event post");
		}
	}
);
router.post(
	"/edit-slider-photo",
	authentication,
	checkAccess("post/web-setting/edit-slider-photo"),
	async function (req, res, next) {
		console.log(req.body);
		try {
			const { webSliderId, photo, slider_title, short_description } = req.body;
			await db.webSlider.update(
				{
					slider_title,
					photo,
					short_description,
					updatedDate: moment.utc(),
				},
				{
					where: {
						webSliderId: webSliderId
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
	}
);

router.get("/slider-photo-list", authentication, checkAccess("web-setting/slider-photo-list"), async (req, res) => {
	try {
		// Retrieve all event posts from the database using the event model
		const sliderPosts = await db.webSlider.findAll({
			attributes: [
				"web_slider_id",
				"short_description",
				"slider_title",
				"photo",
			], // You can directly specify the attribute without an alias
			raw: true, // Get raw JSON data instead of Sequelize instances
		});

		console.log("event posts retrieved:", sliderPosts);

		res.render("web-settings/slider-photo-list", {
			title: "SLIDER-LIST",
			sliderPosts,
			sessionUser: req.user,
		});
	} catch (error) {
		console.error("Error retrieving event posts:", error);
		// Handle errors appropriately
		res.status(500).send("Error retrieving event posts"); // Return an error response to the client
	}
}
);
module.exports = router;
