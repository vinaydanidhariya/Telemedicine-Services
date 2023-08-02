const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models");
const { sequelize } = require("../../models/");
const { Op } = require('sequelize');

router.get("/dashboard", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.render("doctor/dashboard")
});

router.get("/list", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.render("doctor/patient-list", {
		title: "Patient-list"
	})
});

router.post("/doctor-patient-list", authentication, checkAccess("doctor/patient-list"), async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		// if (code === "778899") {
		const patients = await db.WhatsappUser.findAll(
			{ where: { selected_doctor: req.body.doctor_id } }, {
			attributes: [
				"userId",
				"full_name",
				"gender",
				"selected_doctor",
				"phone",
				"user_stat",
				"appointment_date",
				"price",
				"email"
			]
		})
		console.log(patients);
		res.send(patients);
		// } else {
		//   res.send("error");
		// }
	} catch (error) {
		console.log(error);
	}
});

router.get("/schedule", authentication, checkAccess("doctor/schedule"), function (req, res, next) {
	res.render("doctor/doctor-schedule", {
		title: "doctor-schedule"
	})
});

router.post("/scheduler", authentication, checkAccess("doctor/schedule"), function (req, res, next) {
	console.log(req.body);
	console.log(req.query);
});

// Route to handle GET request for fetching all events
router.get('/events', async (req, res) => {
	try {
		console.log(req.user.userId);
		const { timeshift, from, to } = req.query;

		// Parse the dates and apply the timeshift (if available)
		let startDate = new Date(from);
		let endDate = new Date(to);
		if (timeshift) {
			const timeshiftMinutes = parseInt(timeshift, 10);
			startDate.setMinutes(startDate.getMinutes() - timeshiftMinutes);
			endDate.setMinutes(endDate.getMinutes() - timeshiftMinutes);
		}

		const events = await db.Schedule.findAll({
			where: {
				doctorId: req.user.userId,
				// Apply filtering based on start_date and end_date
				start_date: {
					[Op.between]: [startDate, endDate],
				},
				end_date: {
					[Op.between]: [startDate, endDate],
				},
			},
			attributes: [['event_id', 'id'], ['title', 'text'], 'start_date', 'end_date'],
			raw: true,
		});
		res.status(200).json(events);
	} catch (error) {
		console.error('Error fetching events:', error);
		res.status(500).json({ error: 'Error fetching events' });
	}
});

// Route to handle POST request for creating a new event
router.post('/events/', async (req, res) => {
	try {
		const eventData = req.body,
			title = eventData.text,
			eventId = eventData.id,
			startDate = eventData.start_date,
			endDate = eventData.end_date
		console.log(eventData);

		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted") {
				tid = data.id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}
		if (mode == "updated") {
			try {
				console.log("event id", tid);
				const [updatedRowsCount, updatedRows] = await db.Schedule.update(
					{
						title,
						startDate,
						endDate,
					},
					{
						where: { eventId: tid }
					},
				);
				if (updatedRowsCount === 0) {
					return res.status(404).json({ error: 'Event not found' });
				}
				res.status(200).json(updatedRows);
			} catch (error) {
				console.error('Error updating event:', error);
				res.status(500).json({ error: 'Error updating event' });
			}
		} else if (mode == "inserted") {
			const createdEvent = await db.Schedule.create({
				doctorId: req.user.userId,
				title,
				eventId,
				startDate,
				endDate
			}, update_response);
		} else if (mode == "deleted") {
			const createdEvent = await db.Schedule.destroy({
				where: { eventId: tid }
			}, update_response);
		} else
			res.send("Not supported operation");
	} catch (error) {
		console.error('Error creating event:', error);
		res.status(500).json({ error: 'Error creating event' });
	}
});

router.get("/appointment/upcoming-appointment", authentication, checkAccess("doctor/appointments-list"), function (req, res, next) {
	res.render("doctor/upcoming-appointment")
});

router.post("/appointment/doctor-upcoming-appointment-list", async function (req, res, next) {
	const appointment = await db.Appointment.findAll({
		where: { doctorId: req.user.userId, status: false }, // Change the condition as needed
		include: [
			{
				model: db.WhatsappUser,
				as: "patient",
				attributes: [
					"user_id",
					"full_name",
					"gender",
					[sequelize.fn("to_char", sequelize.col("appointment_date"), "DD/MM/YYYY"), "appointment_date"],
					"appointment_time",
					"price",
					"email",
					"user_enter_number",
				],
			},
			{ model: db.User, as: "doctor", attributes: ["user_id", "first_name", "last_name"] },
		],
		attributes: ["appointment_id", "prescription", "status"],
		// raw: true
	});
	res.status(200).json(appointment);
});

router.get("/appointment/past-appointment", authentication, checkAccess("doctor/appointments-list"), function (req, res, next) {
	res.render("doctor/past-appointment")
});

router.post("/appointment/doctor-past-appointment-list", async function (req, res, next) {
	const appointment = await db.Appointment.findAll({
		where: { doctorId: req.user.userId, status: true }, // Change the condition as needed
		include: [
			{
				model: db.WhatsappUser,
				as: "patient",
				attributes: [
					"user_id",
					"full_name",
					"gender",
					[sequelize.fn("to_char", sequelize.col("appointment_date"), "DD/MM/YYYY"), "appointment_date"],
					"appointment_time",
					"price",
					"email",
					"user_enter_number",
				],
			},
			{ model: db.User, as: "doctor", attributes: ["user_id", "first_name", "last_name"] },
		],
		attributes: ["appointment_id", "prescription", "status"],
		// raw: true
	});
	res.status(200).json(appointment);
});

module.exports = router;
