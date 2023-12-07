const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;
const moment = require("moment");

var multer = require("multer");
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images");
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
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
		}
	},
}).single("blog_photo");

router.get("/add-blog", authentication, checkAccess("add-blog"), function (req, res, next) {
	try {
		res.render("blogs/add-blog", {
			title: "BLOG",
			// layout: 'default'
			sessionUser: req.user,
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/add-blog", authentication, checkAccess("post/blogs/add-blog"), async function (req, res, next) {
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
				const { author_name, sort_description, description, title } = req.body;
				console.log(req.body);
				try {
					db.Blogs.create({
						title,
						photo: req.file.filename,
						description,
						sortDescription: sort_description,
						authorName: author_name,
						date: moment.utc(),
						updatedDate: moment.utc(),
					})
						.then(() => {
							let message = `Blog Created successfully`;
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
								message: `Something Went Wrong while creating Blog`,
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
});

router.get("/", authentication, checkAccess("/blogs/list"), async (req, res) => {
	try {
		const blogPosts = await db.Blogs.findAll({
			attributes: ["blog_id", "title", "date", "author_name", "photo", "sort_description", "description"],
			raw: true,
		});

		console.log("Blog posts retrieved:", blogPosts);
		if (blogPosts.length === 0) {
			res.render("blogs/blogs", {
				title: "KidsDoc | Blogs List",
				errorMsg: "No Blogs found",
				sessionUser: req.user,
			});
		} else {
			res.render("blogs/blogs", {
				title: "KidsDoc | Blogs List",
				blogPosts: blogPosts,
				sessionUser: req.user,
			});
		}

		res.render("blogs/blogs", {
			title: "BLOG",
			blogPosts: blogPosts,
			sessionUser: req.user,
		});
	} catch (error) {
		console.error("Error retrieving blog posts:", error);
		res.status(500).send("Error retrieving blog posts"); // Return an error response to the client
	}
});

router.get("/:id", authentication, checkAccess("/blogs/detail"), async (req, res) => {
	try {
		const { id } = req.params;
		const blog = await db.Blogs.findByPk(id);
		const blogPost = blog.toJSON();

		if (!blogPost) {
			// Blog post not found, handle error or redirect to an error page
			res.status(404).send("Blog not found");
			return;
		}

		res.render("blogs/blog-detail", {
			title: blogPost.title,
			description: blogPost.description,
			date: blogPost.date,
			authorName: blogPost.authorName,
			photo: blogPost.photo,
			layout: "blank",
			sessionUser: req.user,
		});
	} catch (error) {
		console.error("Error retrieving blog post:", error);
		// Handle errors appropriately
		res.status(500).send("Error retrieving blog post");
	}
});
router.get("/remove/:id", authentication, checkAccess("/blogs/remove"), async (req, res) => {
	try {
		const { id } = req.params;

		const blog = await db.Blogs.destroy({
			where: {
				blogId: id,
			},
		});

		if (!blog) {
			res.status(404).send("blog not found");
			return;
		} else {
			res.redirect("/blogs");
		}
	} catch (error) {
		console.error("Error retrieving blog post:", error);
		// Handle errors appropriately
		res.status(500).send("Error retrieving blog post");
	}
});

module.exports = router;
