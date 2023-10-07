const express = require("express");
const router = express.Router();
const db = require("../models");
const { convertToMd5 } = require("../utils/helper.js");
const { sequelize } = require("../models");
const { Op } = require("sequelize");
const moment = require('moment');

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});
router.post("/create-doctor", async function (req, res, next) {
	try {
		const {
			firstName,
			lastName,
			email,
			password,
			phone,
			dateOfBirth,
			price,
			qualifications,
			department,
			gender,

			countryCode,
			degreeText,
			university,
			graduationYear,
			physicalPractice,
			experience,
			doctorRegistrationNumber,
			onlineConsultationTimeFrom,
			onlineConsultationTimeTo,
			clinicTimeFrom,
			clinicTimeTo,
			is_admin
		} = req.body;
		let type = 'DOCTOR';
		if (is_admin && is_admin == true || is_admin == "true") {
			type = 'ADMIN';
		}
		const passwordEncrypt = convertToMd5(password);
		const customer = await db.User.create({
			firstName,
			lastName,
			type,
			email,
			dateOfBirth,
			qualifications,
			department,
			gender,
			price,
			password: passwordEncrypt,
			status: true,
			photoUrl: "/images/profile/1.png",
			phone,

			degreeText,
			university,
			graduationYear,
			physicalPractice,
			experience,
			doctorRegistrationNumber,
			onlineConsultationTimeFrom,
			onlineConsultationTimeTo,
			clinicTimeFrom,
			clinicTimeTo,

			degreeUrl: `/uploads/degree_certificates/`,
			aadharCardUrl: `/uploads/aadhar_cards/`,
			panCardUrl: `/uploads/pan_cards/`,
			digitalSignatureUrl: `/uploads/digital_signatures/`
		});

		return res.send({
			status: 200,
			message: "Admin User Created",
			type: "success",
		});
	} catch (error) {
		res.send("error");
		console.log(error);
	}
});

router.post("/wa-user", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		if (code === "778899") {
			const USER = await db.WhatsappUser.findAndCountAll({
				attributes: ["price"],
			});
			const data = USER.rows;
			const count = USER.count;
			let totalIncome = 0;

			for (let i = 0; i < data.length; i++) {
				const price = parseFloat(data[i].price);
				totalIncome += price;
			}
			console.log(totalIncome);
			return res.send({
				status: 200,
				message: totalIncome,
				count: count,
				type: "success",
			});
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/doctor-list", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		if (code === "778899") {
			const USER = await db.User.findAll({
				attributes: [
					"userId",
					"firstName",
					"lastName",
					"price",
					"department",
					"qualifications",
					"photo_url",
				],
				where: {
					department,
				},
			});

			console.log(USER);
			res.send(USER);
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/doctor-member-list", async function (req, res, next) {
    try {
        const { code, page } = req.body;
        const doctorsPerPage = 4;
        let offset = 0;

        if (code === "778899") {
            if (page == 1) {
                offset = 0;
            } else {
                offset = (page - 1) * doctorsPerPage;
            }

            const users = await db.User.findAndCountAll({
                where: {
                    delete: false,
                    type: "DOCTOR"
                },
                attributes: [
                    "userId",
                    "firstName",
                    "lastName",
                    "department",
                    "qualifications",
                    "photo_url",
                    "price",
                ],
                limit: doctorsPerPage,
                offset: offset,
                raw: true
            });

            if (users.rows.length === 0) {
                res.status(400).send("No more doctors available");
            } else {
                res.send(users);
            }
        } else {
            res.send("error");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});



router.post("/doctor-department", async function (req, res, next) {
	try {
		const { code } = req.body;
		console.log(req.body);
		if (code === "778899") {
			const listOfDepartment = await db.Department.findAll({
				// order: [
				//   ['department_name', 'ASC'],
				// ],
				attributes: [
					["department_id", "id"],
					["department_name", "title"],
					["description", "description"],
				],
				raw: true,
				limit: 10,
				tableName: "department",
			});
			console.log(listOfDepartment);
			res.send(listOfDepartment);
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/add-department", async function (req, res, next) {
	try {
		const { code, departmentName, description, status, photo_url } = req.body;
		console.log(req.body);
		if (code === "778899") {
			await db.Department.create({
				departmentName,
				description,
				status,
				photo_url,
			})
				.then((doctor) => {
					res.send(200, "Department created successfully:", doctor);
				})
				.catch((error) => {
					console.error("Error creating doctor:", error);
				});
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/add-whatsappuser", async (req, res) => {
	try {
		const newUser = await db.WhatsappUser.create(req.body);
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ error: "Failed to create a new user." });
	}
});

router.post("/doctor-count", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		if (code === "778899") {
			const USER = await db.User.findAndCountAll({});
			console.log(USER.count);
			const data = USER.count;
			return res.send({
				status: 200,
				message: data,
				type: "success",
			});
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/blog-list", async (req, res) => {
	try {
		// Retrieve all blog posts from the database using the Blog model
		const blogPosts = await db.Blogs.findAll({
			attributes: [
				"blog_id",
				"title",
				[sequelize.fn("to_char", sequelize.col("date"), "DD/MM/YYYY"), "date"],
				"author_name",
				"photo",
				"sort_description",
				"description",
			],
			raw: true,
		});

		console.log("Blog posts retrieved:", blogPosts);

		res.send({
			status: 200,
			message: blogPosts,
			type: "success",
		});
	} catch (error) {
		console.error("Error retrieving blog posts:", error);
		// Handle errors appropriately
		res.status(500).send("Error retrieving blog posts"); // Return an error response to the client
	}
});

router.post("/slider-photo-list", async (req, res) => {
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

		res.send({
			type: 'success',
			message: 'Corousel found!',
			data: sliderPosts
		})
	} catch (error) {
		console.error("Error retrieving event posts:", error);
		// Handle errors appropriately
		res.status(500).send("Error retrieving event posts"); // Return an error response to the client
	}
});
module.exports = router;
