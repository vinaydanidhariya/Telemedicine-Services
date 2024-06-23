const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models");
const { sequelize } = require("../../models/");
const { Op } = require("sequelize");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");
var axios = require("axios");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const request = require("request");
const { validateMediaSize, mediaLimits } = require("../../helpers/validations"); // Make sure to adjust the path accordingly
const Config = require("../../config/config.json")[process.env.NODE_ENV];
const myNumberId = process.env.PHONE_NUMBER_ID;

router.get(
	"/dashboard",
	authentication,
	checkAccess("doctor/patient-list"),
	function (req, res, next) {
		res.render("doctor/dashboard", {
			title: "Dashboard",
		});
	}
);

router.get(
	"/list",
	authentication,
	checkAccess("doctor/patient-list"),
	function (req, res, next) {
		res.render("doctor/patient-list", {
			title: "Patient-list",
		});
	}
);

router.get(
	"/send-prescription",
	authentication,
	checkAccess("doctor/appointments-list"),
	function (req, res, next) {
		res.render("doctor/send-prescription");
	}
);

router.get(
	"/send-prescription/:id",
	authentication,
	checkAccess("doctor/appointments-list"),
	async function (req, res, next) {
		try {
			const prescriptionId = req.params.id;
			const prescription = await db.Prescription.findOne({
				where: {
					prescriptionId: prescriptionId,
					doctorId: req.user.userId,
				},
				include: [
					{
						model: db.User,
						as: "doctor",
						attributes: [
							"userId",
							"firstName",
							"lastName",
							"phone",
							"email",
							"department",
							"physicalPractice",
							"doctorRegistrationNumber"
						], // Select specific doctor attributes you want
					},
					{
						model: db.WhatsappUser, // Assuming this is your patient model
						as: "patient", // Alias for the association in the Prescription model
						attributes: [
							"userId",
							"fullName",
							"phone",
							"email",
							"gender",
							// Convert dateOfBirth to age using SQL function
							[
								db.sequelize.literal(`
							EXTRACT(YEAR FROM age("patient"."date_of_birth"))
						`),
								"age",
							],
						],
					},
				],
			});
			res.render("doctor/send-prescription", {
				title: "Prescription",
				prescription: prescription.toJSON(),
			});
		} catch (error) {
			console.error("Error fetching prescription:", error);
			// Handle the error appropriately, e.g., redirect or render an error page
		}
	}
);

router.get("/prescription-pdf/:id", async function (req, res, next) {
	try {
		const prescriptionId = req.params.id;
		const prescription = await db.Prescription.findOne({
			where: {
				prescriptionId: prescriptionId,
			},
			attributes: [
				"prescriptionId",
				"patientId",
				"doctorId",
				"medicines",
				"medicalInfo",
				"prescriptionMsg",
				"patientHeight",
				"patientWeight",
				"note",
				[
					db.sequelize.fn(
						"to_char",
						db.sequelize.col("Prescription.updatedAt"),
						"DD/MM/YYYY"
					),
					"updatedAt",
				],
			],
			include: [
				{
					model: db.User,
					as: "doctor",
					attributes: [
						"userId",
						"firstName",
						"lastName",
						"phone",
						"email",
						"department",
						"physicalPractice",
						"doctorRegistrationNumber"
					],
				},
				{
					model: db.WhatsappUser,
					as: "patient",
					attributes: [
						"userId",
						"fullName",
						"phone",
						"email",
						"gender",
						[
							db.sequelize.literal(
								`EXTRACT(YEAR FROM age("patient"."date_of_birth"))`
							),
							"age",
						],
					],
				},
			],
		});

		res.render("doctor/pdf-prescription", {
			title: "Prescription",
			prescription: prescription.toJSON(),
			layout: false,
		});
	} catch (error) {
		console.error("Error fetching prescription:", error);
		// Handle the error appropriately, e.g., redirect or render an error page
	}
});

router.post("/download-pdf", async (req, res) => {
	try {
		const { prescriptionId, subject, message, patientEmail } = req.body;
		const appointment = await db.Appointment.findOne({
			where: { prescriptionId }, // Change the condition as needed
			include: [
				{
					model: db.WhatsappUser,
					as: "patient",
					attributes: [
						"user_id",
						"full_name",
						"gender",
						[
							sequelize.fn(
								"to_char",
								sequelize.col("appointment_date"),
								"DD/MM/YYYY"
							),
							"appointment_date",
						],
						"appointment_time",
						"price",
						"email",
						"user_enter_number",
					],
				},
				{
					model: db.User,
					as: "doctor",
					attributes: ["user_id", "first_name", "last_name"],
				},
			],
			attributes: ["appointment_id", "prescription_id", "status"],
			raw: true
		});
		const response = appointment;
		const userInfo = {
			patientName: response['patient.full_name'],
			patientEmail: patientEmail,
			doctorName: `${response['doctor.first_name']} ${response['doctor.last_name']}`,
			dynamicMessage: message, // You didn't specify where the email message comes from in the response
			subject: subject,
		};
		const recipientNumber = response['patient.user_enter_number'];
		const pdfBuffer = await generatePDF(req, prescriptionId);
		const emailResponse = await sendEmail(pdfBuffer, userInfo);
		const facebookResponse = await sendToFacebookAPI(
			pdfBuffer,
			req,
			res,
			recipientNumber
		);

		return res.send({
			message:
				"Success: PDF generated, emailed, and sent to Facebook API.",
			emailResponse: emailResponse,
			// facebookResponse: facebookResponse,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).send("An error occurred");
	}
});

async function generatePDF(req, prescriptionId) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.setViewport({ width: 1920, height: 1080 }); 

	const response = await page.goto(
		`${req.protocol}://${req.get("host")}/doctor/prescription-pdf/${prescriptionId}`,
		{ waitUntil: "networkidle0" }
	);

	if (!response.ok()) {
		throw new Error(`Page load failed with status: ${response.status()}`);
	}

	console.log("Page loaded successfully");

	const pdfBuffer = await page.pdf({ format: "A3", margin: 0 });

	if (pdfBuffer.length === 0) {
		throw new Error("Generated PDF buffer is empty");
	}

	console.log("PDF generated successfully");

	await browser.close();

	return pdfBuffer;
}

async function sendEmail(pdfBuffer, userInfo) {
	try {
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: Config.nodemailer.auth.user,
				pass: Config.nodemailer.auth.pass,
			},
		});

		const emailTemplatePath = path.join(
			__dirname,
			"../../email-templates",
			"prescription.html"
		);
		const template = await fs.readFile(emailTemplatePath, "utf-8"); // Use fs.readFile

		const patientName = userInfo.patientName;
		const doctorName = userInfo.doctorName;
		const dynamicMessage = userInfo.dynamicMessage;
		const subject = userInfo.subject;

		const filledTemplate = template
			.replace(/\[Patient Name\]/g, patientName)
			.replace(/\[Doctor's Name\]/g, doctorName)
			.replace(/\[Your Dynamic Message Here\]/g, dynamicMessage);

		const mailOptions = {
			from: `KidsDoc <${Config.nodemailer.auth.user}>`,
			to: userInfo.patientEmail,
			subject: subject,
			html: filledTemplate,
			attachments: [
				{
					filename: "prescription.pdf",
					content: pdfBuffer,
				},
			],
		};

		await transporter.sendMail(mailOptions);
		return {
			success: true,
			message: "Email sent successfully",
		};
	} catch (error) {
		console.error("Error sending email:", error);
		return {
			success: false,
			message: "Email sending failed",
			error: error.message, // Include error message for debugging
		};
	}
}

async function sendToFacebookAPI(pdfBuffer, req, res, recipientNumber) {
	try {
		const uploadResponse = await uploadPdfToFacebook(pdfBuffer);
		console.log(uploadResponse);
		if (!uploadResponse.id) {
			return res.status(400).json({
				error: "Required Fields: id not found in upload response",
			});
		}

		const messageResponse = await sendPdfMessage(
			uploadResponse.id,
			recipientNumber
		);

		console.log(messageResponse);
		return messageResponse;
	} catch (error) {
		console.error("Facebook API Sending Error:", error);
		res.status(500).json({ error: "Facebook API Error" });
	}
}

async function uploadPdfToFacebook(pdfBuffer) {
	return new Promise((resolve, reject) => {
		request.post(
			{
				url: `https://graph.facebook.com/v13.0/${myNumberId}/media`,
				formData: {
					file: {
						value: pdfBuffer,
						options: {
							filename: "prescription.pdf",
							contentType: "application/pdf",
						},
					},
					type: "application/pdf",
					messaging_product: "whatsapp",
				},
				headers: {
					Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
					"content-type": "multipart/form-data",
				},
			},
			(err, resp, body) => {
				if (err) {
					console.log("Error!", err);
					reject(new Error("Facebook API Upload Error"));
				} else {
					const responseBody = JSON.parse(body);
					resolve(responseBody);
				}
			}
		);
	});
}

async function sendPdfMessage(documentId, recipientNumber) {
	return new Promise((resolve, reject) => {
		const messageData = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: recipientNumber,
			type: "document",
			document: {
				filename: "prescription.pdf",
				id: documentId,
			},
		};

		request.post(
			{
				url: `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`,
				headers: {
					Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
					"content-type": "application/json",
				},
				body: JSON.stringify(messageData),
			},
			(err, resp, body) => {
				if (err) {
					console.log("Error!", err);
					reject(new Error("Facebook API Message Error"));
				} else {
					const responseBody = JSON.parse(body);
					resolve(responseBody);
				}
			}
		);
	});
}

router.post(
	"/save-prescription",
	authentication,
	checkAccess("doctor/patient-list"),
	async function (req, res, next) {
		try {
			// Extract fields from nested objects using a single function
			function extractFields(inputArray, pattern) {
				return inputArray.map((obj) => {
					const extractedObj = {};
					for (const key in obj) {
						const match = key.match(pattern);
						if (match) {
							const [, index, fieldName] = match;
							extractedObj[fieldName] = obj[key];
						}
					}
					return extractedObj;
				});
			}

			// Extract medicines and medical info using the generic extraction function
			const extractedMedicines = extractFields(
				req.body.medicines,
				/medicines\[(\d+)\]\[(\w+)\]/
			);
			const extractedMedicalInfo = extractFields(
				req.body.medicalIn,
				/medical-info\[(\d+)\]\[(\w+)\]/
			);
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
				note: note,
				prescriptionPatientHeight: req.body.prescriptionPatientHeight,
				prescriptionPatientWeight: req.body.prescriptionPatientWeight
			};

			// Create a new prescription record using the organized data
			const createdPrescription = await db.Prescription.update(
				organizedData,
				{
					where: {
						prescriptionId,
						doctorId: req.user.userId,
					},
				}
			);
			// Respond to the client
			res.status(200).json({
				message: "Data received and processed successfully.",
			});
		} catch (error) {
			console.error("Error creating prescription:", error);
			res.status(500).json({
				message: "An error occurred while processing the data.",
			});
		}
	}
);

router.post(
	"/doctor-patient-list",
	authentication,
	checkAccess("doctor/patient-list"),
	async function (req, res, next) {
		try {
			const { code, department } = req.body;
			// if (code === "778899") {
			const patients = await db.WhatsappUser.findAll(
				{ where: { selected_doctor: req.body.doctor_id } },
				{
					attributes: [
						"userId",
						"full_name",
						"gender",
						"selected_doctor",
						"phone",
						"user_stat",
						"appointment_date",
						"price",
						"email",
					],
				}
			);
			res.send(patients);
			// } else {
			//   res.send("error");
			// }
		} catch (error) {
			console.log(error);
		}
	}
);

router.get(
	"/schedule",
	authentication,
	checkAccess("doctor/schedule"),
	async function (req, res, next) {
		const doctor = await db.User.findOne({
			where: { userId: req.user.userId },
		});
		res.render("doctor/doctor-schedule", {
			title: "doctor-schedule",
			doctor: doctor.toJSON(),
		});
	}
);

// Route to handle GET request for fetching all events
router.get("/events", async (req, res) => {
	try {
		const { timeshift, from, to } = req.query;

		// Parse the dates and apply the timeshift (if available)
		let startDate = moment.utc(from, "YYYY-MM-DD HH:mm");
		let endDate = moment.utc(to, "YYYY-MM-DD HH:mm");

		if (timeshift) {
			const timeshiftMinutes = parseInt(timeshift, 10);
			startDate = startDate.subtract(timeshiftMinutes, "minutes");
			endDate = endDate.subtract(timeshiftMinutes, "minutes");
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
			attributes: [
				["event_id", "id"],
				["title", "text"],
				"start_date",
				"end_date",
			],
			raw: true,
		});
		res.status(200).json(events);
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ error: "Error fetching events" });
	}
});
const moment = require("moment");
// Route to handle POST request for creating a new event
router.post("/events/", async (req, res) => {
	try {
		const eventData = req.body,
			title = eventData.text,
			eventId = eventData.id;

		const startDate = moment.utc(eventData.start_date, "YYYY-MM-DD HH:mm");
		const endDate = moment.utc(eventData.end_date, "YYYY-MM-DD HH:mm");

		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err) mode = "error";
			else if (mode == "inserted") {
				tid = data.id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}

		if (mode == "updated") {
			try {
				const [updatedRowsCount, updatedRows] =
					await db.Schedule.update(
						{
							title,
							startDate,
							endDate
						},
						{
							where: { eventId: tid },
						}
					);
				if (updatedRowsCount === 0) {
					return res.status(404).json({ error: "Event not found" });
				}
				res.status(200).json(updatedRows);
			} catch (error) {
				console.error("Error updating event:", error);
				res.status(500).json({ error: "Error updating event" });
			}
		} else if (mode == "inserted") {
			await db.Schedule.create(
				{
					doctorId: req.user.userId,
					title,
					eventId,
					startDate,
					endDate
				},
				update_response
			);
		} else if (mode == "deleted") {
			await db.Schedule.destroy(
				{
					where: { eventId: tid },
				},
				update_response
			);
		} else res.send("Not supported operation");
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(500).json({ error: "Error creating event" });
	}
});

router.get(
	"/appointment/upcoming-appointment",
	authentication,
	checkAccess("doctor/appointments-list"),
	function (req, res, next) {
		res.render("doctor/upcoming-appointment", {
			title: "Upcoming Appointment",
		});
	}
);

router.post(
	"/appointment/doctor-upcoming-appointment-list",
	async function (req, res, next) {
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
						[
							sequelize.fn(
								"to_char",
								sequelize.col("appointment_date"),
								"DD/MM/YYYY"
							),
							"appointment_date",
						],
						"appointment_time",
						"price",
						"email",
						"user_enter_number",
					],
				},
				{
					model: db.User,
					as: "doctor",
					attributes: ["user_id", "first_name", "last_name"],
				},
			],
			attributes: ["appointment_id", "prescription_id", "status"],
			// raw: true
			 order: [['createdAt', 'DESC']]
		});
		console.log(appointment);
		res.status(200).json(appointment);
	}
);

router.get(
	"/appointment/past-appointment",
	authentication,
	checkAccess("doctor/appointments-list"),
	function (req, res, next) {
		res.render("doctor/past-appointment");
	}
);

router.post(
	"/appointment/doctor-past-appointment-list",
	async function (req, res, next) {
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
						[
							sequelize.fn(
								"to_char",
								sequelize.col("appointment_date"),
								"DD/MM/YYYY"
							),
							"appointment_date",
						],
						"appointment_time",
						"price",
						"email",
						"user_enter_number",
					],
				},
				{
					model: db.User,
					as: "doctor",
					attributes: ["user_id", "first_name", "last_name"],
				},
			],
			attributes: ["appointment_id", "prescription_id", "status"],
			// raw: true
		});
		res.status(200).json(appointment);
	}
);

module.exports = router;
