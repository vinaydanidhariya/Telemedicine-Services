const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models");
const { sequelize } = require("../../models/");
const { Op } = require('sequelize');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs')
const path = require('path')
var axios = require('axios');

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

router.get("/generate-prescription/:id", authentication, checkAccess("doctor/appointments-list"), async function (req, res, next) {
	console.log(req.params);
	try {

		const prescriptionId = req.params.id;
		const prescription = await db.Prescription.findOne({
			where: {
				prescriptionId: prescriptionId,
				doctorId: req.user.userId
			},
			attributes: [
				'prescriptionId', 'patientId', 'doctorId', 'medicines',
				'medicalInfo', 'prescriptionMsg', 'note',
				[db.sequelize.fn("to_char", db.sequelize.col("createdAt"), "DD/MM/YYYY"), "createdAt"],
				[db.sequelize.fn("to_char", db.sequelize.col("updatedAt"), "DD/MM/YYYY"), "updatedAt"]
			],
			include: [
				{
					model: db.User,
					as: 'doctor',
					attributes: ['userId', 'firstName', 'lastName', 'phone', 'email', 'department']
				},
				{
					model: db.WhatsappUser,
					as: 'patient',
					attributes: [
						'userId', 'fullName', 'phone', 'email', 'gender',
						[db.sequelize.literal(`EXTRACT(YEAR FROM age("patient"."date_of_birth"))`), 'age']
					]
				}
			],
		});
		console.log(prescription.toJSON());
		res.render("doctor/pdf-prescription", {
			title: "Prescription",
			layout: 'blank',
			prescription: prescription.toJSON()
		})
	} catch (error) {
		console.error("Error fetching prescription:", error);
		// Handle the error appropriately, e.g., redirect or render an error page
	}
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

router.get("/send-pdf/:id", async function (req, res, next) {
	console.log(req.params);
	try {
		const prescriptionId = req.params.id;
		const prescription = await db.Prescription.findOne({
			where: {
				prescriptionId: prescriptionId,
				doctorId: '2'
			},
			attributes: [
				'prescriptionId', 'patientId', 'doctorId', 'medicines',
				'medicalInfo', 'prescriptionMsg', 'note',
				[db.sequelize.fn("to_char", db.sequelize.col("createdAt"), "DD/MM/YYYY"), "createdAt"],
				[db.sequelize.fn("to_char", db.sequelize.col("updatedAt"), "DD/MM/YYYY"), "updatedAt"]
			],
			include: [
				{
					model: db.User,
					as: 'doctor',
					attributes: ['userId', 'firstName', 'lastName', 'phone', 'email', 'department']
				},
				{
					model: db.WhatsappUser,
					as: 'patient',
					attributes: [
						'userId', 'fullName', 'phone', 'email', 'gender',
						[db.sequelize.literal(`EXTRACT(YEAR FROM age("patient"."date_of_birth"))`), 'age']
					]
				}
			],
		});


		console.log(prescription.toJSON());

		res.render("doctor/pdf-prescription", {
			title: "Prescription",
			layout: false,
			prescription: prescription.toJSON()
		})
	} catch (error) {
		console.error("Error fetching prescription:", error);
		// Handle the error appropriately, e.g., redirect or render an error page
	}
});

const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

router.get('/download-pdf', async (req, res) => {
	try {
		const retryCount = 3;
		const delay = 1000;

		async function sendEmailWithRetry() {
			for (let attempt = 1; attempt <= retryCount; attempt++) {
				try {
					const browser = await puppeteer.launch();
					const page = await browser.newPage();

					const pagePromise = page.goto(`${req.protocol}://${req.get('host')}/doctor/send-pdf/2`, { waitUntil: 'networkidle0' });
					const pdfPromise = page.pdf({ format: 'A4' });

					const [_, pdfBuffer] = await Promise.all([pagePromise, pdfPromise]);

					await browser.close();

					// Send email and break out of the loop if successful
					if (await sendEmail(pdfBuffer)) {
						console.log('Email sent successfully');
						break;
					}
				} catch (error) {
					console.error(`Attempt ${attempt} failed with error:`, error);
					if (attempt < retryCount) {
						console.log(`Retrying in ${delay / 1000} seconds...`);
						await new Promise(resolve => setTimeout(resolve, delay));
					} else {
						console.error('All retry attempts failed. Email could not be sent.');
					}
				}
			}
		}

		async function sendEmail(pdfBuffer) {
			try {
				const transporter = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'vinaydanidhariya4114@gmail.com',
						pass: 'bnatnehmtzvrvgox'
					}
				});

				const emailTemplatePath = path.join(__dirname, '../../email-templates', 'prescription.html');
				const template = await readFileAsync(emailTemplatePath, 'utf-8');

				const patientName = 'John Doe';
				const doctorName = 'Dr. Smith';
				const dynamicMessage = 'Thank you for choosing our medical services.';

				const filledTemplate = template
					.replace(/\[Patient Name\]/g, patientName)
					.replace(/\[Doctor's Name\]/g, doctorName)
					.replace(/\[Your Dynamic Message Here\]/g, dynamicMessage);

				const mailOptions = {
					from: 'Child Dr <vinaydanidhariya4114@gmail.com>',
					to: 'vinaydanidhariya04114@gmail.com',
					subject: 'Your Prescription',
					html: filledTemplate,
					attachments: [
						{
							filename: 'prescription.pdf',
							content: pdfBuffer // Attach the PDF binary content here
						}
					]
				};

				await transporter.sendMail(mailOptions);

				try {
					const response = await axios.post(
						`https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/media`,
						fs.createReadStream('/home/vinay4114/Desktop/Shree Hari Clinic/routes/doctor/webpage.pdf'), // Use the PDF binary content here
						{
							headers: {
								Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
								'content-type': 'application/pdf', // Set the correct content type
							},
							params: {
								messaging_product: 'whatsapp', // Adjust as needed
							},
						}
					);
					console.log(response.data);
				} catch (error) {
					console.error('Error:', error);
					// Handle the error appropriately
				}



				request.post(
					{
						url: `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/media`,
						formData: {
							file: {
								value: fs.createReadStream(files.file.path),
								options: {
									filename: files.file.name,
									contentType: files.file.type,
								},
							},
							type: files.file.type,
							messaging_product: process.env.MESSAGING_PRODUCT,
						},
						headers: {
							Authorization: `Bearer ${process.env.META_AUTH_TOKEN}`,
							"content-type": "multipart/form-data",
						},
					},
					function (err, resp, body) {
						if (err) {
							console.log("Error!");
						} else {
							res.json(JSON.parse(body));
						}
					}
				);







				return true; // Successful email sending
			} catch (error) {
				console.error('Error sending email:', error);
				return false; // Email sending failed
			}
		}

		// Call the function to send email with retries
		sendEmailWithRetry();

		// console.log(response);

		// var data = JSON.stringify({
		// 	"messaging_product": "whatsapp",
		// 	"recipient_type": "individual",
		// 	"to": "919265979359",
		// 	"type": "document",
		// 	"document": {
		// 		"filename": "prescritpion.pdf",
		// 		"link": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
		// 	}
		// });

		// var config = {
		// 	method: 'post',
		// 	url: 'https://graph.facebook.com/v17.0/107565462372831/messages',
		// 	headers: {
		// 		'Authorization': 'Bearer EAAKOJhgKrDgBO2swDENZARxc3yGzqM1xFuHMZBv3yoT7QsN9fKEkutVqWMLCMt5vZCZAB5378An7nvIfgZARKgfZC8CSLTkYxoouVh7v7S6hVquFGDkR8nqTIBLkNAHnQPcINxl4mozyZBDixbfJHfQFbuSk4hZAcl62C05PtSGi5aZC0jBap2AtQ9NVBIgu5MUdrQEpzKPGFwkFJgi2QXiIK',
		// 		'Content-Type': 'application/json'
		// 	},
		// 	data: data
		// };

		// axios(config)
		// 	.then(function (response) {
		// 		console.log(JSON.stringify(response.data));
		// 	})
		// 	.catch(function (error) {
		// 		console.log(error);
		// 	});

	} catch (error) {
		console.error('Error:', error);
		res.status(500).send('An error occurred');
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
		const prescriptionId = req.body.prescriptionId;

		// Construct the organized data object
		const organizedData = {
			doctorId: req.user.userId,
			patientId: patientId,
			medicines: extractedMedicines,
			medicalInfo: extractedMedicalInfo,
			prescriptionMsg: prescriptionMsg,
			note: note
		};
		console.log(req.body);

		// Create a new prescription record using the organized data
		const createdPrescription = await db.Prescription.update(organizedData, {
			where: {
				prescriptionId,
				doctorId: req.user.userId
			}
		});
		console.log('Prescription created:', createdPrescription);

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
