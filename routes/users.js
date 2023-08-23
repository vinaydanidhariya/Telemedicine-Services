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

router.post("/doctor-memeber-list", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		if (code === "778899") {
			const USER = await db.User.findAll({
				where: {
					delete: false
				},
				attributes: [
					"userId",
					"firstName",
					"lastName",
					"department",
					"qualifications",
					"photo_url",
				],
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

router.post("/time-slot", async function (req, res, next) {
	console.log(req.body);
	// Function to generate all 15-minute time slots within the schedule hours (8 am to 8 pm) in time format (e.g., "8:00 AM")
	function generateTimeSlots(from, to) {
		const currentDate = moment.utc();

		if (
			from.getDate() === currentDate.getDate() &&
			from.getMonth() === currentDate.getMonth() &&
			from.getFullYear() === currentDate.getFullYear()
		) {
			console.log("today");
			const scheduleStart = moment.utc();
			const currentHour = scheduleStart.getHours();
			const currentMinutes = scheduleStart.getMinutes();

			// Round up the current minutes to the nearest multiple of 15
			const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

			scheduleStart.setHours(currentHour, roundedMinutes, 0, 0); // Set schedule start time to 8 am

			const scheduleEnd = new Date(to);
			scheduleEnd.setHours(20, 0, 0, 0); // Set schedule end time to 8 pm

			const timeSlots = [];
			let currentTime = new Date(scheduleStart);

			while (currentTime <= scheduleEnd) {
				// Format the time in AM/PM format (e.g., "8:00 AM")
				const timeString = currentTime.toLocaleTimeString([], {
					hour: "numeric",
					minute: "2-digit",
				});
				timeSlots.push(timeString);
				currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
			}
			return timeSlots;
		} else {
			console.log("not today");
			const scheduleStart = new Date(from);
			const currentHour = scheduleStart.getHours();
			const currentMinutes = scheduleStart.getMinutes();

			// Round up the current minutes to the nearest multiple of 15
			const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

			scheduleStart.setHours(currentHour, roundedMinutes, 0, 0); // Set schedule start time to 8 am

			const scheduleEnd = new Date(to);
			scheduleEnd.setHours(20, 0, 0, 0); // Set schedule end time to 8 pm

			const timeSlots = [];
			let currentTime = new Date(scheduleStart);

			while (currentTime <= scheduleEnd) {
				// Format the time in AM/PM format (e.g., "8:00 AM")
				const timeString = currentTime.toLocaleTimeString([], {
					hour: "numeric",
					minute: "2-digit",
				});
				timeSlots.push(timeString);
				currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
			}
			return timeSlots;
		}
	}

	// Function to exclude time slots falling between 1 pm and 3 pm
	function excludeTimeRange(timeSlots, startTime, endTime) {
		let date = startTime.toISOString().substring(0, 10);
		return timeSlots.filter((slot) => {
			const slotTime = new Date(`${date} ${slot}`);
			return !(slotTime >= startTime && slotTime < endTime);
		});
	}

	const { from, to } = req.body;

	let startDate = new Date(from);
	let endDate = new Date(to);
	// Find available 15-minute time slots
	const allTimeSlots = generateTimeSlots(startDate, endDate);

	const removeTime = await db.Schedule.findAll({
		where: {
			doctorId: req.body.doctorId,
			// Apply filtering based on start_date and end_date
			start_date: {
				[Op.between]: [startDate, endDate],
			},
			end_date: {
				[Op.between]: [startDate, endDate],
			},
		},
		attributes: [
			["event_id", "id"],
			["title", "text"],
			"start_date",
			"end_date",
		],
		raw: true,
	});

	console.log(removeTime);

	let excludedTimeSlots = [...allTimeSlots]; // Make a copy of allTimeSlots
	for (let i = 0; i < removeTime.length; i++) {
		const eventStart = new Date(removeTime[i].start_date);
		const eventEnd = new Date(removeTime[i].end_date);
		excludedTimeSlots = excludeTimeRange(
			excludedTimeSlots,
			eventStart,
			eventEnd
		);
	}

	console.log(excludedTimeSlots);
	const length = excludedTimeSlots.length;
	excludedTimeSlots.length = length;
	res.send(excludedTimeSlots);
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
