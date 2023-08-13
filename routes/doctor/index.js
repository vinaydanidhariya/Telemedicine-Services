const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models");
const { sequelize } = require("../../models/");
const { Op } = require('sequelize');
const prescription = require("../../models/prescription");

router.get("/dashboard", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.render("doctor/dashboard")
});

router.get("/list", authentication, checkAccess("doctor/patient-list"), function (req, res, next) {
	res.render("doctor/patient-list", {
		title: "Patient-list"
	})
});

router.get("/send-prescription", authentication, checkAccess("doctor/appointments-list"), function (req, res, next) {
	res.render("doctor/send-prescription")
});

router.get("/send-prescription/:id", authentication, checkAccess("doctor/appointments-list"), async function (req, res, next) {
	console.log(req.params);
	try {

		const prescriptionId = req.params.id
		const prescription = await db.Prescription.findOne({
			where: {
				prescriptionId: prescriptionId,
				doctorId: req.user.userId
			},
			include: [
				{
					model: db.User, // Assuming this is your doctor model
					as: 'doctor', // Alias for the association in the Prescription model
					attributes: ['userId', 'firstName', 'lastName', 'phone', 'email', 'department'] // Select specific doctor attributes you want
				},
				{
					model: db.WhatsappUser, // Assuming this is your patient model
					as: 'patient', // Alias for the association in the Prescription model
					attributes: [
						'userId', 'fullName', 'phone', 'email', 'gender',
						// Convert dateOfBirth to age using SQL function
						[db.sequelize.literal(`
							EXTRACT(YEAR FROM age("patient"."date_of_birth"))
						`), 'age']
					]
				}
			],
		});
		console.log(prescription.toJSON());

		res.render("doctor/send-prescription", {
			title: "Prescription",
			prescription: prescription.toJSON()
		})
	} catch (error) {
		console.error("Error fetching prescription:", error);
		// Handle the error appropriately, e.g., redirect or render an error page
	}
});

router.post("/save-prescription", authentication, checkAccess("doctor/patient-list"), async function (req, res, next) {
	try {
		// Extract fields from nested objects using a single function
		function extractFields(inputArray, pattern) {
			return inputArray.map(obj => {
				const extractedObj = {};
				for (const key in obj) {
					const match = key.match(pattern);
					if (match) {
						const [, index, fieldName] = match;
						extractedObj[fieldName] = obj[key];
					}
				}
				return extractedObj;
			})
		}

		// Extract medicines and medical info using the generic extraction function
		const extractedMedicines = extractFields(req.body.medicines, /medicines\[(\d+)\]\[(\w+)\]/);
		const extractedMedicalInfo = extractFields(req.body.medicalIn, /medical-info\[(\d+)\]\[(\w+)\]/);
		console.log(extractedMedicalInfo);
		const prescriptionMsg = req.body.prescriptionMsg;
		const note = req.body.note;
		const patientId = req.body.patientId;

		// Construct the organized data object
		const organizedData = {
			doctorId: req.user.userId,
			patientId: patientId,
			medicines: extractedMedicines,
			medicalInfo: extractedMedicalInfo,
			prescriptionMsg: prescriptionMsg,
			note: note
		};

		// Create a new prescription record using the organized data
		const createdPrescription = await db.Prescription.create(organizedData);
		console.log('Prescription created:', createdPrescription.toJSON());

		// Respond to the client
		res.status(200).json({ message: 'Data received and processed successfully.' });
	} catch (error) {
		console.error('Error creating prescription:', error);
		res.status(500).json({ message: 'An error occurred while processing the data.' });
	}
});


router.post("/doctor-patient-list", authentication, checkAccess("doctor/patient-list"), async function (req, res, next) {
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
		res.send(patients);
		// } else {
		//   res.send("error");
		// }
	} catch (error) {
		console.log(error);
	}
});

router.get("/schedule", authentication, checkAccess("doctor/schedule"), async function (req, res, next) {
	const doctor = await db.User.findOne(
		{ where: { userId: req.user.userId } },
		{ raw: true }
	)
	console.log(doctor.toJSON());
	res.render("doctor/doctor-schedule", {
		title: "doctor-schedule",
		doctor: doctor.toJSON()
	})
});

router.post("/scheduler", authentication, checkAccess("doctor/schedule"), function (req, res, next) {
	console.log(req.body);
	console.log(req.query);
});

// Route to handle GET request for fetching all events
router.get('/events', async (req, res) => {
	try {
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
	res.render("doctor/upcoming-appointment",
		{ title: "Upcoming Appointment" })
});

router.post("/appointment/doctor-upcoming-appointment-list", async function (req, res, next) {
	const appointment = await db.Appointment.findAll({
		where: { doctorId: req.user.userId, status: "RECEIVED" }, // Change the condition as needed
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
		attributes: ["appointment_id", "prescription_id", "status"],
		// raw: true
	});
	console.log(appointment);
	res.status(200).json(appointment);
});

router.get("/appointment/past-appointment", authentication, checkAccess("doctor/appointments-list"), function (req, res, next) {
	res.render("doctor/past-appointment")
});

router.post("/appointment/doctor-past-appointment-list", async function (req, res, next) {
	const appointment = await db.Appointment.findAll({
		where: { doctorId: req.user.userId, status: "COMPLETED" }, // Change the condition as needed
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
